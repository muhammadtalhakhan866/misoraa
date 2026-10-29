# Managing your watches: admin page

Your admin page is at **https://misoraa.vercel.app/admin/**. It is not linked from the website.
From there you can add watches, edit any watch, upload its pictures, write its caption and description,
choose the **signature** piece, mark **hot** items, hide a watch, reorder the collection and delete.

## One-time setup (things only you can do)

Neither of these is in the code, on purpose: they are settings in your own Vercel account.

1. **Connect storage (for pictures and your saved list).**
   Vercel dashboard > the **misoraa** project > **Storage** > **Create** > **Blob** > keep it **Public** >
   **Connect** to the project. This adds a setting called `BLOB_READ_WRITE_TOKEN` automatically.
2. **Set the admin password.**
   The project > **Settings** > **Environment Variables** > add `ADMIN_PASSWORD`, tick **Production**,
   and use a long password (12+ characters, not a name or a word). Only you should know it.
3. **Customer reviews also need a second, private storage** (so phone numbers can never be public). In the same
   Storage page create another **Blob** store, but choose **Private**, and connect it to the project with the
   environment-variable prefix **REVIEWS**, so that its setting is called `REVIEWS_READ_WRITE_TOKEN`. If you ask Claude
   to do this it can do it for you.
4. **Redeploy** (Deployments > the latest one > Redeploy). Settings only apply to new deployments.

Until step 1 is done the admin page says saving is not available. Until step 2 is done it says the
password has not been set up. To change the password later, edit the variable and redeploy; everyone is
signed out when it changes.

## Using it

- **Add a Watch:** name and price are required. Everything else is optional.
  - *Label on the card*: the small tag in the corner (for example "New Release"); tick **Highlight** for a gold fill.
  - *Caption*: one short line shown under the name on the cards.
  - *Description*: the full story on the watch's page. A blank line starts a new paragraph.
  - *Old price*: shown crossed out beside the price, with the saving.
  - *Specifications*: any rows you like ("Case" / "42 mm"). They show as a list on the watch's page.
- **Pictures:** add up to 8 JPG, PNG or WebP pictures (they are shrunk in your browser first, so a phone photo
  is fine). The first is the main picture; use the arrows to reorder. A watch with no picture shows the
  built-in illustration until you add one.
- **Signature piece (the star):** one watch is featured in its own section on the home page, and the
  "Signature" links go to it. Choosing another replaces it.
- **Hot item:** every watch's page shows your hot items underneath as "Most Wanted". If none are marked
  it shows other watches from the collection instead.
- **Hide:** untick "Visible on the site" to take a watch off the site without deleting it.
- **Order:** the up and down arrows move a watch in the collection.
- **Delete:** removes the watch and its pictures for good.

Changes are saved the moment you press Save (or use a star, flame or arrow). Allow about 15 to 30 seconds
for the live site to show them.

## Customer reviews

The **Drop a Review** button on the home page lets a customer send their name, WhatsApp number, star rating
and review. **Nothing appears on the website until you approve it.**

In the admin page open the **Reviews** tab. The tab shows how many are waiting, and the browser tab title shows
it too, for example "(2) MISORAA Admin". There is no email or WhatsApp alert, so look in now and then.

- **Waiting** shows new reviews first. Each shows the customer's WhatsApp number with a **Message on WhatsApp**
  button, in case you want to thank them or ask about a bad review.
- You can fix a spelling mistake in the name or the review, and change the stars, before approving. The customer's
  own words are kept: open "See the customer's original wording" to read them.
- **Approve & Publish** puts it on the website (allow about a minute); it appears at the front of the moving
  line of reviews. **Reject** keeps it off. **Take Off the Website** and **Move Back to Waiting** undo a decision.
  **Delete** removes it for good. On an approved review, **Save & Update Site** publishes your corrections.

**Privacy:** the WhatsApp number is stored only in a separate private storage area and is shown only on this admin
page. It is never part of what the website shows. A visitor can send at most 4 reviews an hour, and a hidden trap
field and a timer turn away most spam bots. The 20 reviews already on the site are written into the site itself,
so they are not edited here.

## How customers buy

Each watch page has **Buy Now** and **Add to Bag**.

- **Buy Now** opens WhatsApp to your number with that one watch already written in the message.
- **Add to Bag** keeps the watch in the customer's bag (in their own browser). The bag slides in from the right,
  they can change quantities, and **Order on WhatsApp** sends the whole order, with the total, as one message.

There is no online payment: you confirm availability, delivery and payment with the customer on WhatsApp.
The shop number is set once, at the top of `assets/js/catalog.js`.

## The six watches already on the site

Until you save for the first time, the site shows the six watches built into it (`assets/js/products-seed.js`).
The first time you press Save in the admin, they become your own list and you can edit or remove them.
Their specifications and descriptions are placeholders: please replace them with the real details of your watches.

## Trying it on your own computer

```
node server.js
```

Then open http://localhost:5173/admin/ and sign in with the password `misoraa-local` (this works only on your
own computer). Pictures and changes made there are kept in a `.devdata` folder and never reach the live site.
Delete that folder to start again.
