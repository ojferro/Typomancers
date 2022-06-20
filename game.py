import pygame as pg
import sys
import socket
import threading
import time
import queue
import os
from pygame.locals import *

# Naming convention:
# 'A' refers to 'me'
# 'B' refers to 'other player'

WIN_WIDTH = 1280
WIN_HEIGHT = 960

COLOR_PALETTE_A = [(74, 143, 231), (11, 57, 84), (116, 30, 153), (250, 169, 22)]
COLOR_PALETTE_B = [(46, 41, 78), (215, 38, 61), (27, 153, 139), (244, 96, 54)]

pg.init()
FONT = pg.font.Font(os.path.dirname(__file__)+"/fonts/CHNOPixelCodePro-Regular.ttf", 32)
FONT_COLOR = (255,255,255)

# Queue containing received messages
received_msg_queue = queue.Queue()

def receive_msg(conn):
    while True:
        received = conn.recv(1024)
        if not received or received == ' ':
            pass
        
        msg = received.decode()
        if msg =='exit':
            break
        else:
            print(f"Received: {msg}")
            received_msg_queue.put(msg)

    print("Rx thread: Finished execution.")

def send_msg(connection, input_str):
        
    msg = input_str.replace('b', '').encode()
    if msg == ' ':
        pass
    else:
        connection.sendall(msg)

def make_rect(width_percent, height_percent, center_x_percent, center_y_percent, position=""):
    ''' Top-left is 0,0 '''

    rect_w_px = int(WIN_WIDTH*width_percent)
    rect_h_px = int(WIN_HEIGHT*height_percent)
    rect_cx_px = int(WIN_WIDTH*center_x_percent)
    rect_cy_px = int(WIN_HEIGHT*center_y_percent)

    rect = Rect(0,0, rect_w_px, rect_h_px)

    rect.centerx = rect_cx_px
    rect.centery = rect_cy_px

    return rect

def keyboard_input(text):
    should_Tx_msg = False
    for event in pg.event.get():
            if event.type == pg.QUIT:
                return
            elif event.type == pg.KEYDOWN:
                
                # Enter key
                if event.key == pg.K_RETURN:
                    should_Tx_msg = True
                    break

                # Backspace
                elif event.key == pg.K_BACKSPACE:
                    # Ctrl+Backspace (delete last word up until last space)
                    if event.mod & pg.KMOD_CTRL:
                        text = " ".join(text.strip().split(" ")[:-1]) + " "
                    # Single Backspace
                    else:
                        text = text[:-1]
                # Append key to text
                else:
                    text += event.unicode

    return text, should_Tx_msg

def configure():
    screen = pg.display.set_mode((WIN_WIDTH, WIN_HEIGHT))
    clock = pg.time.Clock()

    pg.key.set_repeat(500, 30)

    return screen, clock


def main(Tx):
    screen, clock = configure()

    input_text = '' # What Player A is typing
    received_text = 'Sample text' # Message received from another player

    while True:
        
        # Get keyboard input
        input_text, should_Tx_msg = keyboard_input(input_text)

        # Broadcast message to other players if needed
        if should_Tx_msg:
            send_msg(Tx, input_text)
            input_text = ''

        # Check if msgs from other players have been received
        if not received_msg_queue.empty():
            received_text = received_msg_queue.get_nowait()


        # Draw UI
        screen.fill((30, 30, 30))

        textboxA = make_rect(0.65, 0.1, 0.4, 0.85)
        pg.draw.rect(screen, COLOR_PALETTE_A[0], textboxA)

        textboxB = make_rect(0.65, 0.1, 0.6, 0.15)
        pg.draw.rect(screen, COLOR_PALETTE_B[0], textboxB)

        txt_input_r = FONT.render(input_text + "|", True, (255,255,255))
        received_text_r = FONT.render(received_text, True, (255,255,255))

        screen.blit(txt_input_r, (textboxA.midleft[0], textboxA.midleft[1]-FONT.get_height()//2))
        screen.blit(received_text_r, (textboxB.midleft[0], textboxB.midleft[1]-FONT.get_height()//2))

        pg.display.flip()
        clock.tick(30)


if __name__ == '__main__':
    # if len(sys.argv) != 2:
    #     print("usage: %s [port] " % sys.argv[0] )
    #     sys.exit(0)

    # s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # port = int(sys.argv[1])

    # print("Awaiting connection...")
    # s.bind(('', port))
    # s.listen()
    # (connection, addr) = s.accept() 

    # print("Connection received!")
    # print("Type \'exit\' to kill")

    # RxThread = threading.Thread(target = receive_msg, args = ([connection]))
    # RxThread.start()

    pg.init()
    main(None)
    pg.quit()