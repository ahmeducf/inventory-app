#! /usr/bin/env node

console.log(
  'This script populates some test items, categories, and an admin user to the development database.',
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const Item = require('./models/item');
const Category = require('./models/category');
const User = require('./models/user');

const items = [];
const categories = [];
const users = [];

mongoose.set('strictQuery', false);

const mongoDB = userArgs[0];

async function categoryCreate(index, name, description) {
  const category = new Category({ name, description });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, description, category, price, image) {
  const data = {
    name,
    description,
    category,
    price,
    image,
  };

  const item = new Item(data);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function userCreate(
  index,
  username,
  password,
  admin,
  email,
  firstName,
  familyName,
) {
  const data = {
    username,
    password,
    admin,
    email,
    name: {
      firstName,
      familyName,
    },
  };

  const user = new User(data);
  await user.save();
  users[index] = user;
  console.log(`Added user: ${username}`);
}

async function createCategories() {
  console.log('Adding categories');
  await Promise.all([
    categoryCreate(0, 'Electronics', 'Electronic Items'),
    categoryCreate(1, 'Jewelry', 'Jewelry Items'),
    categoryCreate(1, "Men's Clothing", "Men's Clothing Items"),
    categoryCreate(1, "Women's Clothing", "Women's Clothing Items"),
  ]);
}

async function createItems() {
  console.log('Adding items');
  const basedir = process.cwd();
  const images = fs.readdirSync(path.join(basedir, 'public/images'));

  await Promise.all([
    itemCreate(
      0,
      'Test Item 1',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget ultricies ultricies, nunc nisl aliquam nunc, vitae aliq',
      categories[0],
      1099.99,
      images[0],
    ),
    itemCreate(
      1,
      'Test Item 2',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      categories[0],
      1399.99,
      images[1],
    ),
    itemCreate(
      2,
      'Test Item 3',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      categories[0],
      399.99,
      images[2],
    ),
    itemCreate(
      3,
      'Test Item 4',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget ultricies ultricies, nunc nisl aliquam nunc, vitae aliq',
      categories[0],
      279.99,
      images[3],
    ),
    itemCreate(
      4,
      'Test Item 5',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget ultricies ultricies, nunc nisl aliquam nunc, vitae aliq',
      categories[0],
      149.99,
      images[4],
    ),
  ]);
}

async function createUsers() {
  console.log('Adding users');
  await Promise.all([
    userCreate(0, 'admin', 'admin', true, 'admin@admin.com', 'Admin', 'User'),
  ]);
}

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');

  console.log('dropping collections');
  await Item.collection.drop();
  await Category.collection.drop();
  await User.collection.drop();
  console.log('Collections dropped');

  await createCategories();
  await createItems();
  await createUsers();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

main().catch((err) => console.log(err));
