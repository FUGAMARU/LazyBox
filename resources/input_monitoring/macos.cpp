#include <iostream>
#include <Carbon/Carbon.h>
#include <thread>
#include <string>

void checkForShutdown()
{
  std::string input;
  while (true)
  {
    std::getline(std::cin, input);
    if (input == "SHUTDOWN")
    {
      exit(0);
    }
  }
}

void sendKeyboardEvent()
{
  std::cout << "KEY_UP" << std::endl;
  std::flush(std::cout);
}

void sendMouseEvent()
{
  std::cout << "MOUSE_UP" << std::endl;
  std::flush(std::cout);
}

CGEventRef keyboardCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon)
{
  if (type == kCGEventKeyUp)
  {
    sendKeyboardEvent();
  }
  return event;
}

CGEventRef mouseCallback(CGEventTapProxy proxy, CGEventType type, CGEventRef event, void *refcon)
{
  if (type == kCGEventLeftMouseUp || type == kCGEventRightMouseUp || type == kCGEventOtherMouseUp)
  {
    sendMouseEvent();
  }
  return event;
}

int main()
{
  std::thread shutdownThread(checkForShutdown);

  CFMachPortRef keyboardTap = CGEventTapCreate(kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, CGEventMaskBit(kCGEventKeyDown) | CGEventMaskBit(kCGEventKeyUp), keyboardCallback, NULL);
  CFRunLoopSourceRef keyboardRunLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, keyboardTap, 0);
  CFRunLoopAddSource(CFRunLoopGetCurrent(), keyboardRunLoopSource, kCFRunLoopCommonModes);

  CFMachPortRef mouseTap = CGEventTapCreate(kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, CGEventMaskBit(kCGEventLeftMouseDown) | CGEventMaskBit(kCGEventLeftMouseUp) | CGEventMaskBit(kCGEventRightMouseDown) | CGEventMaskBit(kCGEventRightMouseUp) | CGEventMaskBit(kCGEventOtherMouseDown) | CGEventMaskBit(kCGEventOtherMouseUp), mouseCallback, NULL);
  CFRunLoopSourceRef mouseRunLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, mouseTap, 0);
  CFRunLoopAddSource(CFRunLoopGetCurrent(), mouseRunLoopSource, kCFRunLoopCommonModes);

  CFRunLoopRun();

  CFRelease(keyboardRunLoopSource);
  CFRelease(keyboardTap);
  CFRelease(mouseRunLoopSource);
  CFRelease(mouseTap);

  shutdownThread.join();

  return 0;
}
