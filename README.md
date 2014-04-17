Cutthroat
=========

Meteor app that keeps score of cutthroat games, currently deployed on [cutthroat.meteor.com](http://cutthroat.meteor.com).

You probably wont understand this unless you've played a cutthroat style game that involves serving, so I'll give you an overview of that as I go along.

###Game setup
The first thing you're going to want to do is [set your location](http://cutthroat.meteor.com/players). This is basically a password for your players and games, so you might want to choose something unique, (but nothing will prevent you from doing otherwise).

After you have found a good spot, you can create some players on the same page. Watch out for the trash can button, that deletes players without warning. *Danger zone!*

###Game play
Cutthroat style games involve three or more players (or teams, if you're into that kind of thing). Switch over to the 'Games' tab and add at least three of the players that you created, then hit 'Start Game'.

The loser of the first point leaves the table and the winner recieves from the next person in the queue. At this point, the loser generally punches in how the winner won the point, (on a rally or a server). The game continues until two players are dead.

###Stats and what not
Once the game is finished view the stats and make sure to click 'End Game', that is what saves it. After that your games and a log of every point are locked in a MongoDB database deep underground. Maybe someday I'll provide a way to retreive them, or you can always just use Meteor's awesome console api.

###Technologies used
+ (Meter)[http://meteor.com/] - do yourself a favor and check this out if you haven't already
+ (Bootstrap)[http://getbootstrap.com/] < 3 - it sucks to be stuck on an old version. The new version is all 3.sexy though, don't worry
