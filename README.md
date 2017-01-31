A tool to track changes on articles from various websites and taking an statistical analysis from their behaviour.

Articles get copied into ``data`` folder in json format with their related hostname. Only relevant article informations get saved into the article file.

### Tracking includes:

 * Comment section (Enabled, Disabled)
 * Categories
 * Headline
 * Description
 * Actual content

### Data format:
 * *creation*: Creation timestamp
 * *category*: Array of descending categories
 * *headline*: Article headline
 * *headlineShort*: Article headline bait title
 * *description*: Article description
 * *content*: Actual article textual content
 * *revision*: Change counter
 * *changes*: Array of objects containing all changes
 * *url*: raw url to the article
 * *id*: article uid

### Supported websites:
  - Spiegel.de