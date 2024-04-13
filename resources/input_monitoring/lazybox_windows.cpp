#include <iostream>
#include <Windows.h>
#include <thread>

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

LRESULT CALLBACK keyboardCallback(int nCode, WPARAM wParam, LPARAM lParam)
{
  if (nCode >= 0 && wParam == WM_KEYUP)
  {
    sendKeyboardEvent();
  }
  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

LRESULT CALLBACK mouseCallback(int nCode, WPARAM wParam, LPARAM lParam)
{
  if (nCode >= 0 && (wParam == WM_LBUTTONUP || wParam == WM_RBUTTONUP || wParam == WM_MBUTTONUP))
  {
    sendMouseEvent();
  }
  return CallNextHookEx(NULL, nCode, wParam, lParam);
}

int main()
{
  std::thread shutdownThread(checkForShutdown);

  HHOOK keyboardHook = SetWindowsHookEx(WH_KEYBOARD_LL, keyboardCallback, NULL, 0);
  HHOOK mouseHook = SetWindowsHookEx(WH_MOUSE_LL, mouseCallback, NULL, 0);

  MSG msg;
  while (GetMessage(&msg, NULL, 0, 0))
  {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }

  UnhookWindowsHookEx(keyboardHook);
  UnhookWindowsHookEx(mouseHook);

  shutdownThread.join();

  return 0;
}
