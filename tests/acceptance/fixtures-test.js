import moduleForAcceptance from '../helpers/module-for-acceptance';
import { test } from 'qunit';

moduleForAcceptance('Acceptance | Fixtures', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('I can use fixtures', function(assert) {
  server.loadFixtures();

  visit(`/word-smiths/1`);

  andThen(() => {
    let wordSmithsInStore = this.store.peekAll('word-smith');
    let blogPostsInStore = this.store.peekAll('blog-post');

    assert.equal(wordSmithsInStore.get('length'), 1);
    assert.equal(blogPostsInStore.get('length'), 3);
  });
});

test('I can use fixtures with the filename api', function(assert) {
  server.loadFixtures('word-smiths', 'blog-posts');

  visit(`/word-smiths/1`);

  andThen(() => {
    let wordSmithsInStore = this.store.peekAll('word-smith');
    let blogPostsInStore = this.store.peekAll('blog-post');

    assert.equal(wordSmithsInStore.get('length'), 1);
    assert.equal(blogPostsInStore.get('length'), 3);
  });
});

