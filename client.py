import sys
import socket
import threading

def receive_msg(conn):
    while True:
        received = conn.recv(1024)
        if not received or received == ' ':
            pass
        
        msg = received.decode()
        if msg =='exit':
            break
        else:
            print(msg)

def send_msg(conn):
    while True:
        print("Type msg: ")
        input_str = input()
        if input_str == 'exit':
            break
            
        msg = input_str.replace('b', '').encode()
        if msg == ' ':
            pass
        else:
            conn.sendall(msg)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("usage: %s [ip adress][port] " % sys.argv[0] )
        sys.exit(0)

    ip_address, port = sys.argv[1], int(sys.argv[2])

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.connect((ip_address, port))

    print("\'exit\' to kill")

    thread1 = threading.Thread(target = receive_msg, args = ([s]))
    thread2 = threading.Thread(target = send_msg, args = ([s]))
    thread1.start()
    thread2.start()
    thread1.join()
    thread2.join()