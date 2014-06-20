Tenth Exercise (Scaling)
========================

Please complete the following steps:

1. Refactor **"sentigator"** server to use **"[seaport](https://github.com/substack/seaport)"** for port assigning (use **"SPIP"** and **"SPPORT"** process arguments to allow setting the location of the **"[seaport](https://github.com/substack/seaport)"** server from the command line arguments)

2. Use **"[cluster](http://nodejs.org/api/cluster.html)"** to fork multiple **"sentigator"** instances based on the number of available CPU's (-1). Place the cluster initialization code inside a **"cluster.js"** file in **"sentigator"** root folder and use it to require **"sentigator.js"**

3. Use **"[http-proxy](https://github.com/nodejitsu/node-http-proxy)"** to scale **"sentigator"** to support multiple processes. Do it by:
  * Creating a directory named **"proxy"**
  * Creating a file named **"proxy.js"** inside the **"proxy"** directory
  * Creating a package.json for **"proxy"**
  * Using **"[seaport](https://github.com/substack/seaport)"** to get the ports on which the servers are running (use **"SPIP"** and **"SPPORT"** process arguments to get the location of the **"[seaport](https://github.com/substack/seaport)"** server)
  * Implementing a simple Round Robin load balancing selection (**NOTE: you'll have to find a way to dynamically update the servers list from "[seaport](https://github.com/substack/seaport)" server**) 
  * Allowing the server to upgrade to websockets protocol 
  * Running the proxy on HTTPS
  * Termination should be performed at the proxy level
  
#####Use the **"sentiment"** and the **"sentigator"** modules in this repository as a starting point for the exercise