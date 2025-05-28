# Welcome to the Cursor Introduction Activity!
#
# This is an interactive tutorial designed to help you learn how Cursor,
# can help you understand and write code more easily.
# No coding experience required
#
# First, press ⌘L to open the AI chat window if it's not already open.
#
# === GETTING STARTED ===
#
# Feature 1: Understanding Code Through Chat
#   Let's look at this function:

def m(x, y)
  a = 0

  x.each do |i|
    a = a + i
  end

  b = a * (1 + y)
  c = (b * 100).round / 100.0

  return c
end

#   Try these steps:
#   1. Highlight all the code above (from 'def' to 'end')
#   2. Click "Add to Chat" to share the highlighted code with Cursor
#   3. Ask questions in plain English like:
#      - "What might this function be used for?"
#      - "What do you think x and y represent?"
#      - "What would happen if I used these values: x=[25.50, 19.95, 30.00], y=0.20"
#      - "Why do we multiply by 100, round, and divide by 100.0?"
#   4. Notice how Cursor explains things in a way you can understand
#   5. Try highlighting different parts of the code, adding them to chat, and asking specific questions!

# Feature 2: Writing Code Using Plain English
#   Now let's try writing some code using natural language:
#   1. Try typing these requests in the AI chat:
#      - "Create a function that says hello to someone"
#      - "Make a function that converts Celsius to Fahrenheit"
#      - "Write code that checks if a number is positive or negative"
#   2. Watch how Cursor turns your request into actual code
#   3. Feel free to modify the code Cursor writes!

# Write your code here:


# Feature 3: Getting Code Suggestions
#   Cursor can help you write code faster by suggesting what comes next:
#   1. On the line below, type: def greet
#   2. Watch for a suggestion to appear
#   3. Press Tab to accept the suggestion
#   4. Keep accepting suggestions or type your own code

# Try writing a greeting function here:


# Feature 4: Finding and Fixing Problems
#   This function is supposed to find the average temperature for a week,
#   but something's not quite right. Let's investigate:

def get_weekly_average(daily_temps)
  total = 0
  days = 0

  daily_temps.each do |temp|
    if temp > 0
      total = total + temp
      days = days + 1
    end
  end

  average = total / 7
  return average
end

#   Try these steps:
#   1. Highlight the function and add it to chat
#   2. Ask questions like:
#      - "What's wrong with this function?"
#      - "What would happen if I used these temperatures: [72, 75, 68, 70, 73, 65, 71]?"
#      - "What if some temperatures were missing?"
#   3. After understanding the problem, ask Cursor how to fix it
#   4. Try the improved version with different temperature values!

# === HELPFUL SHORTCUTS ===
#
# Here are the main keyboard shortcuts you'll need:
#   Tab - Accept a suggestion
#   ⌘Z - Undo (if you make a mistake)
#
# === MORE HELPFUL FEATURES ===
#
# As you start coding, these features will be super helpful:
#
# 1. Explaining Error Messages
#    When you see a red error message, highlight it and ask Cursor:
#    "What does this error mean and how can I fix it?"
#
# 2. Working with Images
#    Need to show something visually? It's easy:
#    - Press ⌘V to paste an image directly into the chat
#    - Drag and drop an image into the chat
#    - Take a screenshot (⌘⇧4) and paste it directly
#    Then ask questions like:
#    - "What's happening in this error message?"
#    - "Can you help me understand this diagram?"
#    - "What might be wrong in this screenshot?"
#
# 3. Learning Best Practices
#    After writing code that works, try asking:
#    - "Is there a better way to write this?"
#    - "What are some common mistakes to avoid?"
#    - "How would an experienced developer write this?"
#
# === TRY IT YOURSELF ===
#
# Now it's your turn! Here are some things to try:
# 1. Ask Cursor to explain any code you don't understand
# 2. Use plain English to write a simple function (like adding two numbers)
# 3. Let Cursor help you improve your code
#
# === FINAL CHALLENGE: Create a Mini Adventure Game! ===
#
# Let's create a new file called 'adventure.rb' and make a simple text game.
# Here's how to do it:
#
# 1. Create the file:
#    - Press ⌘N for a new file
#    - Save it as 'adventure.rb'
#
# 2. Ask Cursor to help you create the game:
#    "Help me create a simple text adventure game where the player:
#     - Starts in a mysterious room
#     - Can type commands like 'look', 'north', 'south', 'take item'
#     - Has to find a key to escape
#     - The game should be about 3-4 rooms total"
#
# 3. Try running your game:
#    - Open Terminal
#    - Type: ruby adventure.rb
#    - Play your creation!
#
# 4. Make it your own:
#    - Add your own rooms
#    - Create new items
#    - Add more commands
#    - Make the story unique
#
# This is a great way to practice everything you've learned:
# - Using plain English to create code
# - Understanding and modifying code
# - Fixing any bugs you find
# - Adding new features
#
# Remember:
# - You can ask questions just like you're talking to a person
# - There's no wrong way to use Cursor
# - If you're stuck, just ask Cursor for help!
# - The more you practice, the more comfortable you'll become
#
# Have fun creating your adventure!
