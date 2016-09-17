# Kanan's Mabinogi Mod
Mods for Mabinogi using JavaScript

## Installation
1. Download the repository by clicking the green **Clone or Download** button, and extract it anywhere on your computer. Alternatively you can download it through the Github desktop application.
2. Download Python 3.5 (or greater) from
[python.org](https://www.python.org/downloads/).
3. While installing Python, make sure you check the box that says **Add Python 3.x to
PATH** or **Add Python to environment variables**, depending on the version you downloaded.
4. To make sure Python was installed correctly, open a command prompt from the start menu and type
`python --version` and you should get a response.

## Injection
There are three methods to start kanan, manually, automatically or debug.
* Manually -  Run the batch file `kanan.bat` then launch Mabinogi manually with your prefer launching method. 
* Automatically - Update `directory.txt` with your Mabinogi directory path (`C:/Nexon/Mabinogi/` for example), then run the batch file `kanan auto start.bat`.
* Debug - Same as manually, but run `kanan debug mode.bat` instead. This method contains information for testing purposes such as patched addresses which are useful for contributors.

It is possible to launch kanan while Mabinogi is already running, but for best results its best to let it inject as Mabinogi launches, and keep it running in the background. You can run `python kanan.py -h` for more usage information. 

Note: If you are running under User Account Control (UAC), be sure to run the respective batch file as an administrator.

## Features at a glance
Look in the `./scripts/` directory for a full list of mods provided with kanan.
* By default most scripts (mods) that come with kanan are enabled. To disable a
mod you can either add ".disabled" as a suffix to the respective file's name (`FreeZoom.js` > `FreeZoom.disabled.js`) in the `./scripts/` directory, or add the file name (`BitmapFont.js` for example) to `disabled.txt` in the main directory.
* You can attach kanan to different processes if you are running multiple
clients. Open an administrator command prompt where `kanan.py` is located and
run `python kanan.py -p<id>` where `id` is the process id you want to attach to.
 You can also have kanan start multiple clients by running 
`kanan auto-start.bat` or `python kanan.py -s`.
* You can use kanan to load DLL's into Mabinogi by modifying `DllLoader.js`. More
details on what to do are located at the top of that file.
* You can use kanan's data folder as if it was Mabinogi's data folder for file based
mods. Read `UseDataFolder.js` for more detail. Essentially this feature
redirects Mabinogi's data folder, to the data folder `kanan.py` is in, allowing you
to fully mod Mabinogi without touching its folder.
* Simple scripts can be automatically coalesced to cut down on memory usage.
* `PatternScanSnapshot.js` automatically disassembles the locations of patterns
used by each script for archiving and easier updating when a mod breaks.
* Keep kanan running in the background and whenever you close and relaunch Mabinogi
kanan will automatically rerun all the scripts.

Learn about configuring kanan on our [wiki](https://github.com/cursey/kanan/wiki).

## Known issues
* Closing the command prompt after patches have been applied has caused crashes
for some users. If you experience a crash immediately after closing the command
prompt then leave it open for now.
    * If `kanan.bat` does not stay open then something is most likely wrong with
your python install.

## The following scripts are disabled by default
* DisableScreenFlash.js (issue with meteor strike)
* PatternScanSnapshot.js
* LargerTTFontResize.js
* HideObjects.js

## Contributing
Contributions are welcome. If you are contributing a patch that you aren't the
original author of, please give credits at the top of the file. If a patch has
been added and you are the original author of it or know who is, open an issue
so proper credits may be given (or issue a pull request).

## Original patch authors
kanan comes with more mods than are listed here. This is the list of patch 
authors who haven't directly contributed via GitHub's pull requests.
* Blade3575
    * Bitmap font
    * Elf lag
* Step29
    * NPC fast text
    * One click revive
    * Free indoor camera
    * Hide NPC curtains
    * Hide second title
    * No player zoom transparency
    * Mana tunnel lag fix
    * No skill rank up window
    * Windows appear faster
    * Uncapped auto production
    * Mini title menu (TitleOrganize)
    * Mute commerce imp (NoImp)
* Rydian
    * Transformation mastery collect mode always enabled
    * No persistent fighter chain popup
    * Objects between camera and character do not become transparent
    * Hide main title

Many original patches/ideas came from the following projects:
* Fantasia
* MAMP
* JAP
* Gerent/GerentxNogi
* MNG

## Thank you to all contributors!
* QewQew
* C0ZIEST
* Kyralis
* x99user
* Aahzmandius
* Poshwosh
* Warsen
* Rydian
* y3tii
