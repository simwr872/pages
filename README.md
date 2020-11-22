<h1 align=center>
    Rep-record (<a href="https://simwr872.github.io/rep-record/">demo</a>)
</h1>

<p align=center>
    <b>Rep-record is a progressive web application that keeps track of your gym performance.</b>
</p>

# Design goals

* **Cross-platform.** Easy access to the same application across mobile and desktop devices.
* **Offline.** Gyms are often built like Faraday cages or concrete bunkers, preventing online access.
* **Intuitive user interface.** All actions should be easy to complete.

# Building

1. Install the required tools.
   * [Node.js](https://nodejs.org/)
   * [GNU Make](https://www.gnu.org/software/make/)

2. Install the required dependencies.
   ```shell
   npm install
   ```
3. Make the project.
   ```shell
   make -j APP=--minify
   ```
