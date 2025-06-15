## "Set" type
- TODO: return set or items added/removed?
```
define type Set as Collection
	property set = system type Set

	get the size of a set
	get the length of a set
	get the number of <items> of a set
		:JS: this.set.size

	get the items of a set
		:JS: this.set.values()

```

### Adding / Removing
```
	to add an item to a set
		:JS: this.set.add(item)

	to remove an item from a set
		:JS: this.set.delete(item)

	to remove all items from a set
		:JS: items.forEach(item => this.set.remove(item));

	to clear a set
		:JS: this.set.clear()

	understand "the set includes item"
		:JS: this.set.has(item)

```


### Membership / filtering
```
	understand "the set includes item"
	understand "item is in the set"
		:JS: this.set.has(item)

```


### Tests
```
> put new Set into mySet
> add 1 to mySet
< 1

> add 2 to mySet
< 2

> length of mySet
< 2

> add 2 from mySet
< 2

> length of mySet
< 2

> remove 2 from mySet
> length of mySet
< 1

> mySet has 1
< true

> mySet has 2
< false

> clear mySet
> length of mySet
< 0

> add (1,2,2,3) to mySet
> length of mySet
< 3
```
