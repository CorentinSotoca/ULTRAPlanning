# ULTRAPlanning

## Sommaire

Petit program fait pour permettre d'organiser un peut les ICal d'HYPERPlanning pour le BUT Informatique de Villeneuve d'asq.

## Installation

Ce programme ne fonctionne **PAS** avec la derniére version de node. Je ne me sens pas de debugger, il faut donc utiliser la version **12.22.5**, c.f. [la page du gestionaire de version de node](https://www.npmjs.com/package/n) pour plus d'informations.

Clonez le repo sur votre machine, et créez-y un fichier `config.js` dans le quel vous allez mettre vous info personnelles.
Tout d'abord, créez vous un compte telegram, créez ensuite un bot telegram, recuperer votre **ChatId** et votre **BotToken**. Vous allez ensuite avoir besoin du **lien de l'ics**. Entrez les ensuite tel quel:

```js
module.exports = {
    telegramBotToken: "",
    telegramChatId: "",
    icsLink: ""
}
```

Vous mettrez bien sur vos informations entre les double quotes.

Ensuite vous pouvez tapez ces commandes et le tour est joué !

```bash
> npm install
> node .
```