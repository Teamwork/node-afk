#include <iostream>
#include <windows.h>

int main()
{
	// Get the last input event info.
	LASTINPUTINFO li;
	li.cbSize = sizeof(LASTINPUTINFO);
	::GetLastInputInfo(&li);
	// Calculate the time elapsed in seconds.
	DWORD te = ::GetTickCount();
	int elapsed = (te - li.dwTime);

	std::cout << elapsed;
	return 0;
}