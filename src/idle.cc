#include <node.h>
#include "nan.h"
#include "calcidle.h"

using namespace v8;

// Expose synchronous and asynchronous access to our
// Estimate() function
void InitAll(Handle<Object> exports) {
  exports->Set(NanSymbol("calcIdle"),
    FunctionTemplate::New(CalcIdle)->GetFunction());
}

NODE_MODULE(idle, InitAll)
