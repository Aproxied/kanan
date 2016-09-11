// This file is prepended to every script before it is ran by kanan, making
// everything within this file available to all scripts.


// Sends a msg back to kanan's window with the name of the script prepended.
function msg(str) {
    if (scriptName != undefined) {
        send(scriptName + ": " + str);
    }
    else {
        send(str);
    }
}

// Same as above but only outputs a msg when in debug mode.
function dmsg(str) {
    if (debug) {
        msg(str);
    }
}

// Fixes the signature so single ?'s are converted to ??'s.
function fixSig(sig) {
    var oldLen = sig.length;
    var newLen = 0;

    while ((newLen = (sig = sig.replace(' ? ', ' ?? ')).length) != oldLen) {
        oldLen = sig.length;
    }

    return sig;
}

// Scans for patterns in specific modules code section.
function scan(name, sig) {
    if (sig == undefined) {
        sig = name;
        name = 'client.exe';
    }

    sig = fixSig(sig);

    var ranges = Module.enumerateRangesSync(name, 'r-x');
    var address = NULL;

    for (var i = 0; i < ranges.length; ++i) {
        var range = ranges[i];
        var results = Memory.scanSync(range.base, range.size, sig);

        if (results.length > 0) {
            if (results.length > 1) {
                dmsg("More than 1 result for: " + sig);
            }

            address = results[0].address;
            break;
        }
    }

    dmsg(address);

    if (address.isNull()) {
        dmsg("No results for: " + sig);
    }
    else if (debug) {
        // Send the results of the scan back to kanan.py
        send({script: scriptName, signature: sig, address: address});
    }

    return address;
}

// Just adds an offset to the base address of a module.
function moduleOffset(moduleName, offset) {
    var baseAddress = Module.findBaseAddress(moduleName);

    if (baseAddress.isNull()) {
        return NULL;
    }

    return baseAddress.add(offset);
}

// Validates a patch address.
// TODO: Make this more robust.
function isValidPatchAddress(addr) {
    return (!addr.isNull() && addr.toInt32() > 1000);
}

// Patches an array of bytes.
function patch(addr, c) {
    if (!isValidPatchAddress(addr)) {
        msg("Failed to patch.");
        return;
    }

    if (testing) {
        return;
    }

    if (!Array.isArray(c)) {
        c = [c];
    }

    Memory.protect(addr, c.length, 'rwx');

    for (var i = 0; i < c.length; ++i) {
        if (c[i] >= 0 && c[i] <= 0xFF) {
            Memory.writeU8(addr.add(i), c[i]);
        }
    }

    Memory.protect(addr, c.length, 'r-x');
}

// Copies bytes.
function copy(dst, src, len) {
    if (!isValidPatchAddress(dst) || !isValidPatchAddress(src)) {
        msg("Failed to copy.");
        return;
    }

    if (testing) {
        return;
    }

    Memory.protect(dst, len, 'rwx');
    Memory.protect(src, len, 'rwx');

    Memory.copy(dst, src, len);

    Memory.protect(src, len, 'r-x');
    Memory.protect(dst, len, 'r-x');
}

// Writes a string to allocated memory.  Make sure theres enough room at the
// address for str.length + 1 (for the trailing zero).
function writeStr(address, str) {
    for (var i = 0; i < str.length; ++i) {
        Memory.writeU8(address.add(i), str.charCodeAt(i));
    }

    Memory.writeU8(address.add(str.length), 0);
}

// Writes a wide str (utf16) to allocated memory.  Make sure theres at least
// str.length * 2 + 2 (for the trailing zero).
function writeWideStr(address, str) {
    for (var i = 0; i < str.length; ++i) {
        Memory.writeU16(address.add(i * 2), str.charCodeAt(i));
    }

    Memory.writeU16(address.add(str.length * 2), 0);
}

// NativeFunctions used by the following functions.
var LoadLibraryA = new NativeFunction(Module.findExportByName('Kernel32.dll', 'LoadLibraryA'),
    'pointer', ['pointer'], 'stdcall');
var GetProcAddress = new NativeFunction(Module.findExportByName('Kernel32.dll', 'GetProcAddress'),
    'pointer', ['pointer', 'pointer'], 'stdcall');
var VirtualAlloc = new NativeFunction(Module.findExportByName('Kernel32.dll', 'VirtualAlloc'),
    'pointer', ['pointer', 'ulong', 'uint32', 'uint32'], 'stdcall');
var VirtualFree = new NativeFunction(Module.findExportByName('Kernel32.dll', 'VirtualFree'),
    'int', ['pointer', 'ulong', 'uint32'], 'stdcall');

// Allocates some memory.
function allocateMemory(len) {
    // 0x3000 = MEM_COMMIT | MEM_RESERVE
    // 0x40 = PAGE_EXECUTE_READWRITE
    return VirtualAlloc(NULL, len, 0x3000, 0x40);
}

// Frees memory allocated with allocateMemory.
function freeMemory(address, len) {
    // 0x4000 = MEM_DECOMMIT
    return VirtualFree(address, len, 0x4000);
}

// Helper that just allocates memory for a str and writes the str to that
// mem.
function allocateStr(str) {
    var mem = allocateMemory(str.length + 1);

    writeStr(mem, str);

    return mem;
}

// Like above but for wide (utf 16) strings.
function allocateWideStr(str) {
    var mem = allocateMemory(str.length * 2 + 2);

    writeWideStr(mem, str);

    return mem;
}

// Frees an allocated str from allocateStr.
function freeStr(str) {
    // We can pass 0 to freeMemory because str must have been allocated with
    // allocateStr (see docs on VirtualFree where the address is the address
    // returned from VirtualAlloc).
    freeMemory(str, 0);
}

// Alias for above.
function freeWideStr(str) {
    freeStr(str);
}

// Loads the dll located at filepath.  Returns the base address of the loaded
// dll or NULL.
function loadDll(filepath) {
    var str = allocateStr(filepath);
    var result = LoadLibraryA(str);

    freeStr(str);

    return result;
}

// Gets the address of an exported function.
function getProcAddress(moduleName, funcName) {
    // Search the currently loaded modules for the function.
    var addr = Module.findExportByName(moduleName, funcName);

    if (!addr.isNull()) {
        return addr;
    }

    // Otherwise, fallback to the win32 api way of doing things. If the module
    // isn't already loaded it will be.
    var str = allocateStr(funcName);
    var result = GetProcAddress(loadDll(moduleName), str);

    freeStr(str);

    return result;
}

// Wrapper for NativeFunction that uses the above getProcAddress.
function native(moduleName, funcName, returnType, paramTypes, callType) {
    return new NativeFunction(getProcAddress(moduleName, funcName), returnType, paramTypes, callType);
}