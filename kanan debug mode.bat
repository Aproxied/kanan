@echo off
@setlocal enableextensions
@cd /d "%~dp0"

pip -q install frida toml
python ./kanan.py --debug
