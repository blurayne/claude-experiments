#!/usr/bin/env python3
"""Add an `animal_types` field (list of canonical animal names, usually one)
to every item in calendar_data.json.gz, derived from web_display_name and,
when available (current items only), the richer product_description fetched
from ty.com's product page by fetch_product_descriptions.py -- run that
script first if you want this pass to benefit from it.

The keyword list below was built by frequency-counting every word that
appears in the description half of web_display_name (and later, the
product_description text) across all items, so it's grounded in what's
actually in the data rather than guessed. Specific breeds/species map to a
general canonical animal (e.g. "chihuahua", "husky", "poodle" -> "dog") so a
search for "dog" or "dogs" finds all of them; distinctive animals (fox,
panda, koala...) keep their own category. Non-animal costume/character
words (ghost, witch, santa, gnome, snowman...) are intentionally excluded.
"""
import gzip
import json
import re

# canonical animal -> keywords that map to it (word-boundary matched)
ANIMAL_KEYWORDS = {
    "dog": ["dog", "dogs", "puppy", "pup", "chihuahua", "chihauhau", "poodle", "husky",
            "corgi", "dachshund", "dauchand", "bulldog", "schnauzer", "spaniel",
            "terrier", "pug", "labrador", "shepherd", "cocker", "rottweiler",
            "rottweiller", "retreiver", "retriever", "dalmatian", "dalmation",
            "basset", "hound", "doodle", "beagle"],
    "cat": ["cat", "cats", "kitten", "kitty", "siamese", "tabby", "calico"],
    "bear": ["bear", "bears", "teddy"],
    "panda": ["panda"],
    "unicorn": ["unicorn"],
    "owl": ["owl", "owls"],
    "monkey": ["monkey", "monkeys", "chimp", "chimpanzee", "gorilla",
               "orangutan", "baboon", "mandrill", "silverback"],
    "bunny": ["bunny", "bunnies", "rabbit", "rabbits"],
    "penguin": ["penguin", "penquin", "penguins"],
    "elephant": ["elephant"],
    "giraffe": ["giraffe"],
    "lion": ["lion"],
    "tiger": ["tiger"],
    "fox": ["fox"],
    "zebra": ["zebra"],
    "leopard": ["leopard"],
    "cheetah": ["cheetah"],
    "lynx": ["lynx"],
    "dragon": ["dragon", "komodo"],
    "mermaid": ["mermaid"],
    "dinosaur": ["dinosaur", "dino", "brontosaurus", "stegosaurus"],
    "snake": ["snake"],
    "frog": ["frog"],
    "pig": ["pig", "pigs"],
    "horse": ["horse", "pony"],
    "cow": ["cow"],
    "sheep": ["sheep", "lamb"],
    "goat": ["goat"],
    "rooster": ["rooster", "chick", "chicken"],
    "duck": ["duck", "mallard"],
    "swan": ["swan"],
    "goose": ["goose"],
    "turkey": ["turkey"],
    "flamingo": ["flamingo"],
    "sloth": ["sloth"],
    "raccoon": ["raccoon", "racoon"],
    "hedgehog": ["hedgehog"],
    "koala": ["koala"],
    "seal": ["seal"],
    "fish": ["fish", "goldfish"],
    "octopus": ["octopus"],
    "squirrel": ["squirrel"],
    "spider": ["spider"],
    "turtle": ["turtle", "tortoise"],
    "narwhal": ["narwhal"],
    "platypus": ["platypus"],
    "kangaroo": ["kangaroo"],
    "walrus": ["walrus"],
    "whale": ["whale", "orca"],
    "shark": ["shark"],
    "dolphin": ["dolphin"],
    "moose": ["moose"],
    "otter": ["otter"],
    "beaver": ["beaver"],
    "skunk": ["skunk"],
    "alligator": ["alligator"],
    "snail": ["snail"],
    "crab": ["crab"],
    "lobster": ["lobster"],
    "ladybug": ["ladybug"],
    "bee": ["bee"],
    "seahorse": ["seahorse"],
    "manatee": ["manatee"],
    "stork": ["stork"],
    "peacock": ["peacock"],
    "toucan": ["toucan"],
    "parrot": ["parrot", "cockatoo"],
    "eagle": ["eagle"],
    "robin": ["robin"],
    "cardinal": ["cardinal"],
    "bat": ["bat"],
    "axolotl": ["axolotl"],
    "hamster": ["hamster"],
    "guinea pig": ["guinea"],
    "llama": ["llama"],
    "lemur": ["lemur"],
    "meerkat": ["meerkat", "meercat"],
    "armadillo": ["armadillo"],
    "gecko": ["gecko"],
    "iguana": ["iguana"],
    "capybara": ["capybara"],
    "donkey": ["donkey"],
    "deer": ["deer"],
    "camel": ["camel"],
    "rat": ["rat"],
    "mouse": ["mouse"],
    "groundhog": ["groundhog"],
    "caterpillar": ["caterpillar"],
    "rhino": ["rhino", "rhinocerous"],
    "bull": ["bull"],
    "reindeer": ["reindeer"],
    "monster": ["lochness", "monster"],
}

KEYWORD_TO_ANIMAL = {}
for animal, keywords in ANIMAL_KEYWORDS.items():
    for kw in keywords:
        KEYWORD_TO_ANIMAL[kw] = animal

WORD_RE = re.compile(r"[a-z]+")


def derive_animal_types(*texts):
    found = []
    for text in texts:
        if not text:
            continue
        for w in WORD_RE.findall(text.lower()):
            animal = KEYWORD_TO_ANIMAL.get(w)
            if animal and animal not in found:
                found.append(animal)
    return found


def main():
    with gzip.open("calendar_data.json.gz", "rt") as f:
        items = json.load(f)

    n_with_animal = 0
    n_from_product_desc_only = 0
    for item in items:
        from_name = derive_animal_types(item["web_display_name"])
        types = derive_animal_types(item["web_display_name"], item.get("product_description"))
        item["animal_types"] = types
        if types:
            n_with_animal += 1
        if types and not from_name:
            n_from_product_desc_only += 1

    with gzip.open("calendar_data.json.gz", "wt") as f:
        json.dump(items, f, indent=2)

    print(f"Classified {len(items)} items: {n_with_animal} matched an animal type, {len(items) - n_with_animal} unmatched")
    print(f"  (of which {n_from_product_desc_only} were only found via the richer product_description text)")

    from collections import Counter
    counts = Counter(t for i in items for t in i["animal_types"])
    print("\nTop animal types:")
    for animal, n in counts.most_common(30):
        print(f"  {animal}: {n}")


if __name__ == "__main__":
    main()
