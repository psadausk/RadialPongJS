# RadialPongJS
Radial implementation of pong using the CreateJS Suite.

Implemented. 

1) Basic movement algorithm. 
   a) Given the two vectors (The players current point, and nearest point on circle) relative to the center of the circle
   b) Use the dot product to get the angle between them
   c) Use that angle to figure out the arc length on the circle
   d) take the min of that number and the set velocity with the given delta.
   e) using the found arc length, get the angle between the player and the where the arc length ends
   f) Move the player to the new point on the circle
  
