A belongsTo relationship has the following possible schemas. For each schema, the child model can be in six states with respect to its parent:

 - the child can be saved and the parent can be one of: undefined, new or saved

 - the child can be new and the parent can be one of: undefined, new or saved

This is how the tests in this directory are organized.

# belongsTo
Given Post, Author models
For the Post model

## basic
author: belongsTo()

## named
writer: belongsTo('author')

## reflexive, one-way
post: belongsTo()

## named reflexive
childPost: belongsTo('post')

## inverse (implicit)
author: belongsTo()

(author)
posts: hasMany()

## inverse (explicit)
author: belongsTo('author', { inverse: 'redPosts' })

(author)
posts: hasMany('post', { inverse: 'author' })
drafts: hasMany('post')

## multiple (conflict)
primaryAuthor: belongsTo('author')
secondaryAuthor: belongsTo('author')

(author)
posts: hasMany()
