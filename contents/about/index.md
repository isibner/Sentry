---
title: About
template: markdown.html
---

# About Sentry

The initial inspiration from Sentry came from lessons learned while building [TodoBot](https://github.com/FabioFleitas/todobot). The idea of tracking source-code quality was a good one, but there were two problems with the approach we took:

1. It was difficult to extend TodoBot to track other source-code-level issues, such as ignored tests.
2. TodoBot was tied to GitHub, and could not easily be modified to support other Git hosts, such as BitBucket, GitLab, or Stash.

Sentry solves these problems by providing a plugin API. **Source plugins** are used to represent remote Git sources: GitHub is supported (in public and private flavors), and BitBucket/GitLab support are coming soon. **Service plugins** represent ways to process code received from a source, and can be reused across many different Git sources. The Sentry app acts as an intermediate layer between sources and services, listening to the sources and running the active services for each repo when the data changes.

<div class="centered">
    ![Sentry architecture diagram](https://docs.google.com/drawings/d/1T4fILw5CzybzsWGTqvf85UDYSr69ShZOT4TGyaQYMnQ/pub?w=720&h=540)
</div>