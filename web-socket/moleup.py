import random
from time import sleep


def gen_mole_array():
    mole_array = []
    for _ in range(5):
        mole_array.append(1 if random.random() < 0.5 else 0)
    return mole_array


def max_moles(mole_array, max_moles):
    # check if there are more than max_moles
    if mole_array.count(1) > max_moles:
        one_locs = [i for i, x in enumerate(mole_array) if x == 1]
        # generate random positions to remove if total "up" moles is greater than max
        rand_size = len(one_locs) - max_moles
        one_locs = random.sample(one_locs, rand_size)
        # remove the extra moles
        for i in one_locs:
            mole_array[i] = 0
    return mole_array


while True:
    sleep(1)
    moles = gen_mole_array()
    moles = max_moles(moles, 3)
    print(moles)
