# 🧪 API Testing Examples for Kids

Here are some simple examples of how to test and explore the APIs in different ways!

## 🐍 Python Examples

### Simple API Calls
```python
import requests
import json

# Get a dog fact
def get_dog_fact():
    response = requests.get("https://dogapi.dog/api/v2/facts")
    if response.status_code == 200:
        data = response.json()
        fact = data['data'][0]['attributes']['body']
        print(f"🐕 Dog Fact: {fact}")
    else:
        print("Oops! Couldn't get a dog fact right now.")

# Get a dad joke
def get_dad_joke():
    headers = {'Accept': 'application/json'}
    response = requests.get("https://icanhazdadjoke.com/", headers=headers)
    if response.status_code == 200:
        joke_data = response.json()
        print(f"😂 Dad Joke: {joke_data['joke']}")
    else:
        print("No jokes available right now!")

# Get a fun fact
def get_fun_fact():
    response = requests.get("https://uselessfacts.jsph.pl/random.json?language=en")
    if response.status_code == 200:
        fact_data = response.json()
        print(f"🌍 Fun Fact: {fact_data['text']}")
    else:
        print("Couldn't get a fun fact!")

# Get random numbers
def get_random_numbers():
    url = "https://www.random.org/integers/?num=3&min=1&max=10&col=1&base=10&format=plain&rnd=new"
    response = requests.get(url)
    if response.status_code == 200:
        numbers = response.text.strip().split('\n')
        print(f"🎲 Random Numbers: {', '.join(numbers)}")
    else:
        print("Couldn't generate random numbers!")

# Run all functions
if __name__ == "__main__":
    print("🌟 Welcome to the API Explorer! 🌟\n")
    get_dog_fact()
    print()
    get_dad_joke()
    print()
    get_fun_fact()
    print()
    get_random_numbers()
```

### Interactive API Explorer
```python
import requests
import random

def api_explorer():
    """Interactive API explorer for kids"""
    
    apis = {
        "1": {
            "name": "Dog Facts 🐕",
            "url": "https://dogapi.dog/api/v2/facts",
            "headers": {},
            "parser": lambda r: r.json()['data'][0]['attributes']['body']
        },
        "2": {
            "name": "Dad Jokes 😂", 
            "url": "https://icanhazdadjoke.com/",
            "headers": {"Accept": "application/json"},
            "parser": lambda r: r.json()['joke']
        },
        "3": {
            "name": "Fun Facts 🌍",
            "url": "https://uselessfacts.jsph.pl/random.json?language=en", 
            "headers": {},
            "parser": lambda r: r.json()['text']
        },
        "4": {
            "name": "Cat Facts 🐱",
            "url": "https://catfact.ninja/fact",
            "headers": {},
            "parser": lambda r: r.json()['fact']
        }
    }
    
    while True:
        print("\n🎮 API Explorer Menu:")
        for key, api in apis.items():
            print(f"{key}. {api['name']}")
        print("5. Random API")
        print("6. Exit")
        
        choice = input("\nChoose an option (1-6): ")
        
        if choice == "6":
            print("👋 Thanks for exploring APIs! Keep learning!")
            break
        elif choice == "5":
            choice = random.choice(list(apis.keys()))
            print(f"🎲 Randomly selected: {apis[choice]['name']}")
        
        if choice in apis:
            api = apis[choice]
            try:
                response = requests.get(api['url'], headers=api['headers'])
                if response.status_code == 200:
                    result = api['parser'](response)
                    print(f"\n✨ {api['name']}: {result}")
                else:
                    print(f"❌ Error: Couldn't get data from {api['name']}")
            except Exception as e:
                print(f"❌ Something went wrong: {e}")
        else:
            print("❌ Invalid choice! Please try again.")

if __name__ == "__main__":
    api_explorer()
```

## 🌐 JavaScript Examples

### Browser Console Examples
```javascript
// Copy and paste these into your browser's console (F12)

// Get a dog fact
async function getDogFact() {
    try {
        const response = await fetch('https://dogapi.dog/api/v2/facts');
        const data = await response.json();
        console.log('🐕 Dog Fact:', data.data[0].attributes.body);
    } catch (error) {
        console.log('❌ Error getting dog fact:', error);
    }
}

// Get a dad joke
async function getDadJoke() {
    try {
        const response = await fetch('https://icanhazdadjoke.com/', {
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        console.log('😂 Dad Joke:', data.joke);
    } catch (error) {
        console.log('❌ Error getting joke:', error);
    }
}

// Get a fun fact
async function getFunFact() {
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        const data = await response.json();
        console.log('🌍 Fun Fact:', data.text);
    } catch (error) {
        console.log('❌ Error getting fun fact:', error);
    }
}

// Get all facts at once
async function getAllFacts() {
    console.log('🌟 Getting all facts...\n');
    await getDogFact();
    await getDadJoke();
    await getFunFact();
}

// Run this to get all facts!
getAllFacts();
```

### Simple HTML Page
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kid-Friendly API Explorer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f0f8ff;
        }
        .api-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 10px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #45a049;
        }
        .result {
            margin-top: 15px;
            padding: 15px;
            background-color: #e8f5e8;
            border-radius: 5px;
            border-left: 4px solid #4CAF50;
        }
    </style>
</head>
<body>
    <h1>🌟 Kid-Friendly API Explorer</h1>
    
    <div class="api-card">
        <h2>🐕 Dog Facts</h2>
        <button onclick="getDogFact()">Get Dog Fact</button>
        <div id="dogResult"></div>
    </div>
    
    <div class="api-card">
        <h2>😂 Dad Jokes</h2>
        <button onclick="getDadJoke()">Get Dad Joke</button>
        <div id="jokeResult"></div>
    </div>
    
    <div class="api-card">
        <h2>🌍 Fun Facts</h2>
        <button onclick="getFunFact()">Get Fun Fact</button>
        <div id="factResult"></div>
    </div>
    
    <div class="api-card">
        <h2>🎲 Random Numbers</h2>
        <button onclick="getRandomNumbers()">Generate Numbers</button>
        <div id="numberResult"></div>
    </div>

    <script>
        async function getDogFact() {
            const resultDiv = document.getElementById('dogResult');
            resultDiv.innerHTML = '🔄 Loading...';
            
            try {
                const response = await fetch('https://dogapi.dog/api/v2/facts');
                const data = await response.json();
                const fact = data.data[0].attributes.body;
                resultDiv.innerHTML = `<div class="result">🐕 ${fact}</div>`;
            } catch (error) {
                resultDiv.innerHTML = '<div class="result">❌ Could not get dog fact</div>';
            }
        }

        async function getDadJoke() {
            const resultDiv = document.getElementById('jokeResult');
            resultDiv.innerHTML = '🔄 Loading...';
            
            try {
                const response = await fetch('https://icanhazdadjoke.com/', {
                    headers: { 'Accept': 'application/json' }
                });
                const data = await response.json();
                resultDiv.innerHTML = `<div class="result">😂 ${data.joke}</div>`;
            } catch (error) {
                resultDiv.innerHTML = '<div class="result">❌ Could not get joke</div>';
            }
        }

        async function getFunFact() {
            const resultDiv = document.getElementById('factResult');
            resultDiv.innerHTML = '🔄 Loading...';
            
            try {
                const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
                const data = await response.json();
                resultDiv.innerHTML = `<div class="result">🌍 ${data.text}</div>`;
            } catch (error) {
                resultDiv.innerHTML = '<div class="result">❌ Could not get fun fact</div>';
            }
        }

        async function getRandomNumbers() {
            const resultDiv = document.getElementById('numberResult');
            resultDiv.innerHTML = '🔄 Loading...';
            
            try {
                const response = await fetch('https://www.random.org/integers/?num=5&min=1&max=100&col=1&base=10&format=plain&rnd=new');
                const numbers = await response.text();
                const numberList = numbers.trim().split('\n').join(', ');
                resultDiv.innerHTML = `<div class="result">🎲 Random Numbers: ${numberList}</div>`;
            } catch (error) {
                resultDiv.innerHTML = '<div class="result">❌ Could not generate numbers</div>';
            }
        }
    </script>
</body>
</html>
```

## 🔧 Testing Tips for Kids

### 1. **Response Time Testing**
```python
import time
import requests

def test_api_speed(url, name):
    start_time = time.time()
    response = requests.get(url)
    end_time = time.time()
    
    response_time = (end_time - start_time) * 1000  # Convert to milliseconds
    print(f"{name}: {response_time:.2f}ms")
    
    return response_time

# Test all APIs
apis = [
    ("https://dogapi.dog/api/v2/facts", "Dog Facts API"),
    ("https://icanhazdadjoke.com/", "Dad Jokes API"),
    ("https://catfact.ninja/fact", "Cat Facts API")
]

print("🏃‍♂️ API Speed Test:")
for url, name in apis:
    test_api_speed(url, name)
```

### 2. **Error Handling Practice**
```python
import requests

def safe_api_call(url, name):
    try:
        response = requests.get(url, timeout=5)  # 5 second timeout
        
        if response.status_code == 200:
            print(f"✅ {name}: Success!")
            return response.json()
        else:
            print(f"⚠️ {name}: Got status code {response.status_code}")
            return None
            
    except requests.exceptions.Timeout:
        print(f"⏰ {name}: Request timed out")
        return None
    except requests.exceptions.ConnectionError:
        print(f"🔌 {name}: Connection error")
        return None
    except Exception as e:
        print(f"❌ {name}: Unexpected error - {e}")
        return None

# Test with error handling
safe_api_call("https://dogapi.dog/api/v2/facts", "Dog Facts")
safe_api_call("https://fake-api-that-doesnt-exist.com", "Fake API")
```

### 3. **Data Analysis Fun**
```python
import requests
from collections import Counter

def analyze_joke_lengths():
    """Analyze the length of dad jokes"""
    joke_lengths = []
    
    print("📊 Analyzing dad joke lengths...")
    
    for i in range(10):  # Get 10 jokes
        try:
            response = requests.get("https://icanhazdadjoke.com/", 
                                  headers={'Accept': 'application/json'})
            if response.status_code == 200:
                joke = response.json()['joke']
                joke_lengths.append(len(joke))
                print(f"Joke {i+1}: {len(joke)} characters")
        except:
            print(f"Couldn't get joke {i+1}")
    
    if joke_lengths:
        avg_length = sum(joke_lengths) / len(joke_lengths)
        print(f"\n📈 Average joke length: {avg_length:.1f} characters")
        print(f"📏 Shortest joke: {min(joke_lengths)} characters")
        print(f"📏 Longest joke: {max(joke_lengths)} characters")

analyze_joke_lengths()
```

## 🎯 Learning Challenges

### Beginner Challenges:
1. **API Response Race:** See which API responds fastest
2. **Fact Collector:** Collect 20 different facts from various APIs
3. **Joke Rating:** Get 10 jokes and rate them from 1-10

### Intermediate Challenges:
1. **Error Detective:** Intentionally break API calls and handle errors gracefully
2. **Data Formatter:** Take API responses and format them in different ways
3. **API Combiner:** Use multiple APIs together to create something new

### Advanced Challenges:
1. **Mini Dashboard:** Create a simple web page showing data from all APIs
2. **API Monitor:** Check if APIs are working and track their uptime
3. **Custom Parser:** Write functions to extract specific information from responses

Remember: The best way to learn is by doing! Try these examples, modify them, break them, fix them, and most importantly - have fun! 🚀
