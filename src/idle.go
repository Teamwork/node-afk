package main

import (
	"os"
	"strconv"
	"syscall"
	"unsafe"
)

var lastInputInfo struct {
	cbSize uint32
	dwTime uint32
}

func main() {
	lastInputInfo.cbSize = uint32(unsafe.Sizeof(lastInputInfo))

	user32 := syscall.MustLoadDLL("user32.dll")
	kernal32 := syscall.MustLoadDLL("Kernel32.dll")             // or NewLazyDLL() to defer loading
	getLastInputInfo := user32.MustFindProc("GetLastInputInfo") // or NewProc() if you used NewLazyDLL()
	getTickCount := kernal32.MustFindProc("GetTickCount")

	tickCount, _, _ := getTickCount.Call()

	idle, _, _ := getLastInputInfo.Call(uintptr(unsafe.Pointer(&lastInputInfo)))

	if idle == 0 || tickCount == 0 {
		panic("It didn't work")
	}

	os.Stdout.Write([]byte(strconv.FormatInt((int64(tickCount) - int64(lastInputInfo.dwTime)), 10)))
}
