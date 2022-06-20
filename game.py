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
SCREEN_SIZE_MULTIPLIER = 1/1.5
WIN_WIDTH = 1280*SCREEN_SIZE_MULTIPLIER
WIN_HEIGHT = 960*SCREEN_SIZE_MULTIPLIER

COLOR_PALETTE = [(74, 143, 231), (11, 57, 84), (116, 30, 153), (250, 169, 22)]

pg.init()
FONT_SIZE = 18
FONT = pg.font.Font(os.path.dirname(__file__)+"/fonts/CHNOPixelCodePro-Regular.ttf", FONT_SIZE)
FONT_COLOR = (255,255,255)

# Queue containing received messages
received_msg_queue = queue.Queue()

def Rx_msg(connection):
    ''' Receive message from other players '''

    while True:
        received = connection.recv(1024)
        if not received or received == ' ':
            pass
        
        msg = received.decode()
        if msg =='exit':
            break
        else:
            print(f"Received: {msg}")
            received_msg_queue.put(msg)

    print("Rx thread: Finished execution.")

def Tx_msg(connection, input_str):
    ''' Transmit message to other players'''

    msg = input_str.replace('b', '').encode()
    if msg == ' ':
        pass
    else:
        connection.sendall(msg)

def draw_ui(screen):
    # Set up Screen
    screen.fill((10, 10, 10))
    total_players = 4

    #turn_stage = "preparing"
    turn_stage = "incantation"

    # Draw Character Cards
    for i in range(total_players):
        character_card = make_rect(0.18, 0.3, (1/(total_players+1))*(i+1), 0.5)
        pg.draw.rect(screen, COLOR_PALETTE[0], character_card,5)

    # Draw Top Console
    top_console = make_rect(0.9, 0.3, 0.5, 0.18)
    pg.draw.rect(screen, COLOR_PALETTE[0], top_console,5)

    # Draw Bottom Console
    bottom_console = make_rect(0.9, 0.3, 0.5, 0.82)
    pg.draw.rect(screen, COLOR_PALETTE[0], bottom_console,5)

    # Labels
    if turn_stage == "incantation":
        print_text(screen, "Spell Incantation", bottom_console, 0)
   
    if turn_stage == "preparing":
        print_text(screen, "Spell Deck", bottom_console, 0)

    pg.display.flip()

    
def print_text(screen, text, console, row):
    text_color = pg.Color('white')
    text_to_print = FONT.render(text, True, text_color)
    screen.blit(text_to_print, (console.topleft[0]+(FONT.get_height()/2), console.topleft[1]+(FONT.get_height()*row)))


def make_rect(width_percent, height_percent, center_x_percent, center_y_percent):
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
    screen = pg.display.set_mode((WIN_WIDTH, WIN_HEIGHT), pg.RESIZABLE)
    clock = pg.time.Clock()

    repeat_key_delay = 500 # [ms] Time before the first repeat key down event is registered
    repeat_key_interval = 30 # [ms] Time before subsequent key down event is registered
    pg.key.set_repeat(repeat_key_delay, repeat_key_interval)

    return screen, clock


def main(Tx):
    screen, clock = configure()

    input_text = '' # What Player A is typing
    received_text = 'Sample text' # Message received from another player

    screen = pg.display.set_mode((WIN_WIDTH, WIN_HEIGHT),pg.RESIZABLE)

    while True:
        
        # Get keyboard input
        input_text, should_Tx_msg = keyboard_input(input_text)

        # Broadcast message to other players if needed
        if should_Tx_msg:
            Tx_msg(Tx, input_text)
            input_text = ''

        # Check if msgs from other players have been received
        if not received_msg_queue.empty():
            received_text = received_msg_queue.get_nowait()

        draw_ui(screen)
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

    # RxThread = threading.Thread(target = Rx_msg, args = ([connection]))
    # RxThread.start()

    pg.init()
    main(None)
    pg.quit()