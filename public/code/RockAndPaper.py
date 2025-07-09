#python 3.7.1
import random
print("Rock and paper game by Reymart")

score = {
  "Computer": 0,
  "You": 0,
  "Tie": 0
}
choices = {
  "1": "Rock",
  "2": "Paper",
  "3": "Scissor"
}
youDecide = {
  "Rock": "Scissor",
  "Paper": "Rock",
  "Scissor": "Paper"
}

def DecisionMaker(you, computer):
  print("-------------------------------------")
  winner = ""
  if youDecide[you]:
    bot = youDecide[you]
    print(f'you: {you} / computer: {computer}')
    if you == computer:
      print("it's a tie!")
      winner = "Tie"
    else:
      if computer == bot:
        print("you win :)")
        winner = "You"
      else:
        print("you lose :(")
        winner = "Computer"
  score[winner] += 1
  print(f'YOU = {score["You"]} / COMPUTER = {score["Computer"]} / TIE = {score["Tie"]}')
  print("-------------------------------------")

def StartInput():
  print("Choose one")
  bot = random.randint(1,len(choices))
  for i in choices:
    print(i,"=", choices[i])
  answer = input("Your pick:")
  if answer.isnumeric() == bool(1) and int(answer) < len(choices)+1:
    if choices[answer]:
      you = choices[answer]
      computer = choices[str(bot)]
      DecisionMaker(you, computer)
  else:
    error = {
      "code" : 101,
      "reason" : answer+" is not in the choices"
    }
    print("Unable to process your input, please select a number in the choices")
  return StartInput()
StartInput()

