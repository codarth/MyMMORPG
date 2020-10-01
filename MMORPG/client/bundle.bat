@echo off
call npm run build
del /f/s/q ..\server\public\
rd /s/q ..\server\public\
mkdir ..\server\public\
xcopy /e/h/i assets ..\server\public\assets\
xcopy /e/h/i build ..\server\public\build\
copy index.html ..\server\public\index.html