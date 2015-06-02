var list = {
  random: function () {
    var items = arguments.length > 0 ? arguments : [];

    return function () {
      return faker.random.array_element(items);
    };
  },

  cycle: function () {
    var items = arguments.length > 0 ? arguments : [];

    return function (i) {
      return items[i % items.length];
    };
  }
};


export default {
  name:     faker.name,
  address:  faker.address,
  phone:    faker.phone,
  internet: faker.internet,
  company:  faker.company,
  image:    faker.image,
  lorem:    faker.lorem,
  date:     faker.date,
  random:   faker.random,
  finance:  faker.finance,
  hacker:   faker.hacker,
  list:     list
};
