# Collaborative quiz solving platform
Create a room and share room code for others to join. Ask and answer questions in real-time. Utilizes Spring WebFlux sinks and ndjson for minimal fully reactive backend to frontend data flow between multiple clients, all updated in real-time reactively without the need for any database.
Room information is stored at runtime in a table and released when everyone exists the room. This solution can be easily modified to support minimalistic real-time chat as well.
