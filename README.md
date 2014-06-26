# jenkingd

The daemon component of JENKING which does all the work of scraping gerrit and jenkins to do what it's supposed to do.

## Getting started

jenkingd requires PhantomJS and RSVP as JavaScript dependencies.

**Installing globally (recommended)**

    1. `npm install -g jenkingd`
    2. `jenkingd`

**Installing locally**

Run the following commands in the repository root and you should have it running on port 8777 (currently hard-coded.)

    1. `npm install`
    2. `npm start`