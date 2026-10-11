def play_fizzbuzz():
    """File FizzBuzz.spell"""
    for number in range(1, 101):
        if (number / 15).is_integer():
            print(number, "fizzbuzz")
        elif (number / 3).is_integer():
            print(number, "fizz")
        elif (number / 5).is_integer():
            print(number, "buzz")
        else:
            print(number)


play_fizzbuzz()
