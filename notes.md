TodoBot Process:
* Authenticate through Github
* Add the repos TodoBot should "follow"
* TodoBot adds Welcome Message
* TodoBot goes through initial run-through code & creates initial todos. These do not reference commit messages.
* Afterwards, pushes are sent to our webhook end-point and we parse for "TODO" (disregarding capitlization).

Format of TODO:
TODO {String message}
labels (optional) {comma-delimited added labels (no need to add `todo` or `branch` labels)}
body (optional) {longer body message added to issue}


Notes about branches:
* We should add labels that are `branch-{name}` to the issue. That way it is easy to track which branches the todos are in.
* Some todos will have multiple branches, we must be able to track different branches with the labels.
* If a branch is deleted, then the labels for that todo must be deleted.

Ways to Complete a Todo:
* The TODO message is removed
* The TODO message is altered (this will create a new issue)
* The branch is delete & no other branch owns it (can be verified based on labels)