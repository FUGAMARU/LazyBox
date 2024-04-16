#include <iostream>
#include <Carbon/Carbon.h>
#include <thread>
#include <string>
#include <chrono>

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

bool createEventTap(CGEventMask mask, CGEventTapCallBack callback, CFMachPortRef &tap, CFRunLoopSourceRef &runLoopSource)
{
  tap = CGEventTapCreate(kCGSessionEventTap, kCGHeadInsertEventTap, kCGEventTapOptionDefault, mask, callback, NULL);
  if (!tap)
  {
    std::cerr << "Failed to create event tap." << std::endl;
    return false;
  }

  runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0);
  if (!runLoopSource)
  {
    std::cerr << "Failed to create run loop source." << std::endl;
    CFRelease(tap);
    return false;
  }

  CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, kCFRunLoopCommonModes);
  return true;
}

int main()
{
  CFMachPortRef keyboardTap = nullptr;
  CFRunLoopSourceRef keyboardRunLoopSource = nullptr;
  CFMachPortRef mouseTap = nullptr;
  CFRunLoopSourceRef mouseRunLoopSource = nullptr;

  while (true)
  {
    if (keyboardTap)
    {
      CFRelease(keyboardTap);
      keyboardTap = nullptr;
    }
    if (keyboardRunLoopSource)
    {
      CFRelease(keyboardRunLoopSource);
      keyboardRunLoopSource = nullptr;
    }
    if (mouseTap)
    {
      CFRelease(mouseTap);
      mouseTap = nullptr;
    }
    if (mouseRunLoopSource)
    {
      CFRelease(mouseRunLoopSource);
      mouseRunLoopSource = nullptr;
    }

    if (createEventTap(CGEventMaskBit(kCGEventKeyDown) | CGEventMaskBit(kCGEventKeyUp), keyboardCallback, keyboardTap, keyboardRunLoopSource) &&
        createEventTap(CGEventMaskBit(kCGEventLeftMouseDown) | CGEventMaskBit(kCGEventLeftMouseUp) | CGEventMaskBit(kCGEventRightMouseDown) | CGEventMaskBit(kCGEventRightMouseUp) | CGEventMaskBit(kCGEventOtherMouseDown) | CGEventMaskBit(kCGEventOtherMouseUp), mouseCallback, mouseTap, mouseRunLoopSource))
    {
      break; // キーボードイベントとマウスイベントのイベントタップの作成が成功したらループを抜ける
    }
    // 1秒ごとに再試行する
    std::this_thread::sleep_for(std::chrono::seconds(1));
  }

  CFRunLoopRun();

  if (keyboardRunLoopSource)
    CFRelease(keyboardRunLoopSource);
  if (keyboardTap)
    CFRelease(keyboardTap);
  if (mouseRunLoopSource)
    CFRelease(mouseRunLoopSource);
  if (mouseTap)
    CFRelease(mouseTap);

  return 0;
}
