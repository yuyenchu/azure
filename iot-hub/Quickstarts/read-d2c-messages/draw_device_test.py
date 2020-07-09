import matplotlib.pyplot as plt
import matplotlib.animation as animation
import threading
from time import sleep


count = 0
def wrapper():
    global count
    while True:
      print(count)
      count += 1
      sleep(1)

def main():
  read_thread = threading.Thread(target=wrapper,daemon = True)
  read_thread.start()

  plt.figure()
  plt.axis([0, 10, 0, 10])
  while True:
    plt.cla()
    plt.scatter(count, count, color='k', label = 'count')
    plt.legend(loc=4)
    plt.pause(0.05)
    # fig = plt.figure()
    # #creating a subplot 
    # ax1 = fig.add_subplot(1,1,1)
    # ax1.set_ylim(0, 60)
    # def animate(i,ax1):
    #   ax1.clear()
    #   ax1.plot([0,i,2*i],[20,40,60])
    #   plt.xlabel('time')
    #   plt.ylabel('temperature')
    #   plt.title('plot')	
    # animation.FuncAnimation(fig, animate, fargs=(ax1), interval=1000) 
    # animate(1)
  plt.show()
    
if __name__ == '__main__':
    main()
