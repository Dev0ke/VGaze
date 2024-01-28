package main

import (
	"strings"

	"www.velocidex.com/golang/velociraptor/config"
	logging "www.velocidex.com/golang/velociraptor/logging"
)

var (
	nobanner_flag = app.Flag(
		"nobanner", "Suppress the Velociraptor banner").Bool()
)

var banner = ``

func doBanner() {
	if *nobanner_flag {
		return
	}
	for _, line := range strings.Split(banner, "\n") {
		if len(line) > 0 {
			logging.Prelog(line)
		}
	}

	version := config.GetVersion()

	logging.Prelog("<yellow>This is SecurityP %v built on %v (%v)", version.Version,
		version.BuildTime, version.Commit)
}
