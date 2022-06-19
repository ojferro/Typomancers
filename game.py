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


def main(Tx):
    screen = pg.display.set_mode((WIN_WIDTH, WIN_HEIGHT))
    base_path = os.path.dirname(__file__)
    font = pg.font.Font(base_path+"/fonts/CHNOPixelCodePro-Regular.ttf", 32)

    clock = pg.time.Clock()
    text_input_color = pg.Color('dodgerblue2')
    text_other_color = pg.Color('green')
    text = ''
    msg = ''

    while True:
        for event in pg.event.get():
            if event.type == pg.QUIT:
                return
            elif event.type == pg.KEYDOWN:
                if event.key == pg.K_RETURN:
                    print(text)
                    send_msg(Tx, text)
                    text = ''
                elif event.key == pg.K_BACKSPACE:
                    text = text[:-1]
                else:
                    text += event.unicode


        screen.fill((30, 30, 30))


        # Draw text boxes
        textboxA = make_rect(0.65, 0.1, 0.4, 0.85)
        pg.draw.rect(screen, COLOR_PALETTE_A[0], textboxA)

        textboxB = make_rect(0.65, 0.1, 0.6, 0.15)
        pg.draw.rect(screen, COLOR_PALETTE_B[0], textboxB)

        txt_input = font.render(text, True, text_input_color)

        if not received_msg_queue.empty():
            msg = received_msg_queue.get_nowait()

        received_text = font.render(msg, True, text_other_color)

        screen.blit(txt_input, (textboxA.midleft[0], textboxA.midleft[1]-font.get_height()//2))
        screen.blit(received_text, (textboxB.midleft[0], textboxB.midleft[1]-font.get_height()//2))

        pg.display.flip()
        clock.tick(30)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("usage: %s [port] " % sys.argv[0] )
        sys.exit(0)

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    port = int(sys.argv[1])

    print("Awaiting connection...")
    s.bind(('', port))
    s.listen()
    (connection, addr) = s.accept() 

    print("Connection received!")
    print("Type \'exit\' to kill")

    RxThread = threading.Thread(target = receive_msg, args = ([connection]))
    RxThread.start()
    
    pg.init()
    main(connection)
    pg.quit()