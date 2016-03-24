import moduleForAcceptance from '../helpers/module-for-acceptance';
import { test } from 'qunit';

moduleForAcceptance('Acceptance | Serializers', {
  beforeEach() {
    this.store = this.application.__container__.lookup('service:store');
  }
});

test('Serializers can provide default includes', function(assert) {
  let wordSmith = server.create('word-smith');
  server.createList('blog-post', 3, { wordSmithId: wordSmith.id });

  visit(`/word-smiths/${wordSmith.id}`);

  andThen(() => {
    let wordSmithsInStore = this.store.peekAll('word-smith');
    let blogPostsInStore = this.store.peekAll('blog-post');

    assert.equal(wordSmithsInStore.get('length'), 1);
    assert.equal(blogPostsInStore.get('length'), 3);
  });
});

