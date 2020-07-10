import os
import sys
for i in range(0,5):
  print(i)
print("restarting")
# os.execl(sys.executable, os.path.abspath(__file__), *sys.argv) 
os.execv(sys.executable, [sys.executable] + sys.argv)