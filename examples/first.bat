@ECHO OFF
cd %~dp0
CALL second.bat
SET BASE-PATH= C:\Program Files
SET APP_PATH=%BASE-PATH%\%APP%
SET BATCH_FOLDER=%~dp0

CALL %BATCH_FOLDER%\third.bat

:: Se houver necessidade de mudar pode ser sobrescritas
::SET COMMECDIS_ID=201
       REM             asdasd
ECHO %EXECUTABLE%
PAUSE