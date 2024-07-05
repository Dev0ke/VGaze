package authenticators

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/Velocidex/ordereddict"
	"github.com/gorilla/csrf"
	api_proto "www.velocidex.com/golang/velociraptor/api/proto"
	utils "www.velocidex.com/golang/velociraptor/api/utils"
	config_proto "www.velocidex.com/golang/velociraptor/config/proto"
	"www.velocidex.com/golang/velociraptor/constants"
	"www.velocidex.com/golang/velociraptor/json"
	"www.velocidex.com/golang/velociraptor/services"
)

const lockoutFile = "/tmp/login_attempts.txt"
const lockoutDuration = time.Hour
const maxAttempts = 5

func logAttempt(ip string) {
	f, err := os.OpenFile(lockoutFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		// fmt.Println("Error opening lockout file:", err)
		return
	}
	defer f.Close()
	timestamp := time.Now().Unix()
	_, err = f.WriteString(fmt.Sprintf("%s %d\n", ip, timestamp))
	if err != nil {
		// fmt.Println("Error writing to lockout file:", err)
	}
}

func getRecentAttempts(ip string) int {
	data, err := os.ReadFile(lockoutFile)
	if err != nil {
		// fmt.Println("Error reading lockout file:", err)
		return 0
	}

	lines := strings.Split(string(data), "\n")
	now := time.Now().Unix()
	count := 0
	for _, line := range lines {
		if line == "" {
			continue
		}
		parts := strings.Split(line, " ")
		if len(parts) != 2 {
			continue
		}
		recordedIP := parts[0]
		timestamp, err := strconv.ParseInt(parts[1], 10, 64)
		if err != nil {
			continue
		}
		if recordedIP == ip && now-timestamp <= int64(lockoutDuration.Seconds()) {
			count++
		}
	}
	return count
}

// Implement basic authentication.
type BasicAuthenticator struct {
	config_obj       *config_proto.Config
	base, public_url string
}

// Basic auth does not need any special handlers.
func (self *BasicAuthenticator) AddHandlers(mux *http.ServeMux) error {
	return nil
}

func (self *BasicAuthenticator) AddLogoff(mux *http.ServeMux) error {
	mux.Handle(utils.Join(self.base, "/app/logoff.html"),
		IpFilter(self.config_obj,
			http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				username, _, ok := r.BasicAuth()
				if !ok {
					w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
					http.Error(w, "authorization failed", http.StatusUnauthorized)
					return
				}

				// The previous username is given as a query parameter.
				params := r.URL.Query()
				old_username, ok := params["username"]
				if ok && len(old_username) == 1 && old_username[0] != username {
					// Authenticated as someone else.
					http.Redirect(w, r, utils.Homepage(self.config_obj),
						http.StatusTemporaryRedirect)
					return
				}

				w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)
				http.Error(w, "authorization failed", http.StatusUnauthorized)
			})))

	return nil
}

func (self *BasicAuthenticator) IsPasswordLess() bool {
	return false
}

func (self *BasicAuthenticator) RequireClientCerts() bool {
	return false
}

func (self *BasicAuthenticator) AuthRedirectTemplate() string {
	return ""
}

func (self *BasicAuthenticator) AuthenticateUserHandler(
	parent http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-CSRF-Token", csrf.Token(r))
		w.Header().Set("WWW-Authenticate", `Basic realm="Restricted"`)

		/// -----
		ip := strings.Split(r.RemoteAddr, ":")[0]
		if getRecentAttempts(ip) >= maxAttempts {
			http.Error(w, "Too many failed attempts, try again later.", http.StatusForbidden)
			return
		}

		username, password, ok := r.BasicAuth()
		if !ok {
			http.Error(w, "Not authorized", http.StatusUnauthorized)
			return
		}

		// Get the full user record with hashes so we can
		// verify it below.
		users_manager := services.GetUserManager()
		user_record, err := users_manager.GetUserWithHashes(r.Context(),
			username, username)
		if err != nil || user_record.Name != username {
			logAttempt(ip)
			services.LogAudit(r.Context(),
				self.config_obj, username, "Unknown username",
				ordereddict.NewDict().
					Set("remote", r.RemoteAddr).
					Set("status", http.StatusUnauthorized))

			http.Error(w, "authorization failed", http.StatusUnauthorized)
			return
		}
		ok, err = users_manager.VerifyPassword(r.Context(),
			username, username, password)
		if !ok || err != nil {
			logAttempt(ip)
			services.LogAudit(r.Context(),
				self.config_obj, username, "Invalid password",
				ordereddict.NewDict().
					Set("remote", r.RemoteAddr).
					Set("status", http.StatusUnauthorized))

			http.Error(w, "authorization failed", http.StatusUnauthorized)
			return
		}

		// Does the user have access to the specified org?
		err = CheckOrgAccess(r, user_record)
		if err != nil {
			services.LogAudit(r.Context(),
				self.config_obj, username, "Unauthorized username",
				ordereddict.NewDict().
					Set("remote", r.RemoteAddr).
					Set("status", http.StatusUnauthorized))

			http.Error(w, "authorization failed", http.StatusUnauthorized)
			return
		}

		// Checking is successful - user authorized. Here we
		// build a token to pass to the underlying GRPC
		// service with metadata about the user.
		user_info := &api_proto.VelociraptorUser{
			Name: username,
		}

		// Must use json encoding because grpc can not handle
		// binary data in metadata.
		serialized, _ := json.Marshal(user_info)
		ctx := context.WithValue(
			r.Context(), constants.GRPC_USER_CONTEXT, string(serialized))

		// Need to call logging after auth so it can access
		// the USER value in the context.
		GetLoggingHandler(self.config_obj)(parent).ServeHTTP(
			w, r.WithContext(ctx))
	})
}
