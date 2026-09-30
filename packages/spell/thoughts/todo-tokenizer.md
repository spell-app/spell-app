TASK
- parse markdown, ```english(+jsx)```, ```styles``` etc

- parse markdown syntax
- ``` => parse ENGLISH_TOKENS and/or JSX_TOKENS until next ```

PARSE ENGLISH_TOKENS
	- as current, except for <\w+ => PARSE_JSX

PARSE_JSX
	-
