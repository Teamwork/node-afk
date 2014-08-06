#include <node.h>
#include "nan.h"
#include "calcidle.h"

using namespace v8;

// Simple synchronous access to the `Estimate()` function
NAN_METHOD(CalcIdle) {
  	NanScope();

	// Get the last input event info.
	LASTINPUTINFO li;
	li.cbSize = sizeof(LASTINPUTINFO);
	::GetLastInputInfo(&li);
	// Calculate the time elapsed in seconds.
	DWORD te = ::GetTickCount();
	int elapsed = (te - li.dwTime);

  	NanReturnValue(Number::New(elapsed));
}
