@echo off
setlocal
chcp 65001
set "target_directory=%TEMP%\gui_datastore\"

if exist "%target_directory%" (
    echo 清除目录：%target_directory%
    rd /s /q "%target_directory%"
    if exist "%target_directory%" (
        echo 清除失败，请手动删除目录：%target_directory%
    ) else (
        echo 目录已成功清除：%target_directory%
    )
) else (
    echo 目录不存在：%target_directory%
)

endlocal