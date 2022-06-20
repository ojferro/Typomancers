import queue
import threading

class Server:
    def __init__(self, connection):
        self.connection = connection

        # Queue containing received messages for communication between threads
        self.received_msg_queue = queue.Queue()

        self.RxThread = threading.Thread(target = self.Rx_msg)
        self.RxThread.start()

    def Rx_msg(self):
        ''' Receive message from other players '''

        while True:
            received = self.connection.recv(1024)
            if not received or received == ' ':
                pass
            
            msg = received.decode()
            if msg =='exit':
                break
            else:
                print(f"Received: {msg}")
                self.received_msg_queue.put(msg)

        print("Rx thread: Finished execution.")

    def Tx_msg(self, input_str):
        ''' Transmit message to other players'''

        msg = input_str.replace('b', '').encode()
        if msg == ' ':
            pass
        else:
            self.connection.sendall(msg)