import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import LoadingIndicator from '../LoadingIndicator';
import ErrorReload from '../ErrorReload';

@inject("CollectionStore", "QuestionStore", "UserStore", "routing")
@observer
class QuestionAnswer extends Component {

  constructor() {
    super();
    this.state = {
      collection: null,
      collectionItems: null,
      networkError: false,
    }
  }

  componentWillMount() {
    let { CollectionStore, match } = this.props;
    CollectionStore.getCollectionById(parseInt(match.params.collectionId))
      .then((collection) => {
        this.setState({collection});
      })
      .catch(() => {
        this.setState({networkError: true});
      });

    CollectionStore.getCollectionItemsById(parseInt(match.params.collectionId))
      .then((collectionItems) => {
        this.setState({collectionItems})
      })
      .catch(() => {
        this.setState({networkError: true});
      });
  }

  componentDidMount() {
    let { CollectionStore, QuestionStore, match } = this.props;
    let { collection, collectionItems, networkError } = this.state;

    if ( networkError ) {
      return <ErrorReload message="We couldn't load this collection!"/>;
    } else if (!collection || collectionItems === null) {
      return <LoadingIndicator/>;
    }

    let collectionId = parseInt(match.params.collectionId);
    let orderNumber = parseInt(match.params.orderNumber);
    let choiceId = parseInt(match.params.choiceId);

    CollectionStore.getCollectionItemsById(collectionId)
      .then((collectionItems) => {
        let item = collectionItems[orderNumber];

        // Escape if this question somehow doesn't exist
        if (!item) {
          this.navigateToEnd();
          return;
        }

        let question = QuestionStore.questions.get(item.object_id);

        if (question.subtype === 'likert') {
          QuestionStore.voteQuestionLikert(item.object_id, choiceId, collectionId);
        } else if (question.subtype === 'mcq') {
          QuestionStore.voteQuestionMCQ(item.object_id, choiceId, collectionId);
        }

        // Navigate to next question if it exists, otherwise the end
        if (orderNumber < collectionItems.length - 1) {
          this.navigateToNextItem()
        }else {
          this.navigateToEnd()
        }
      })
      .catch(() => {
        this.setState({networkError: true})
      });
  }

  navigateToItem(item) {
    this.props.routing.push(`/survey/${this.props.match.params.collectionId}/flow/${item}/${this.dynamicConfig.encodeConfig()}`)
  }

  navigateToNextItem() {
    let currentItem = parseInt(this.props.match.params.orderNumber);
    this.navigateToItem(currentItem + 1);
  }

  navigateToEnd() {
    this.props.routing.push(`/survey/${this.props.match.params.collectionId}/end/${this.dynamicConfig.encodeConfig()}`)
  }

  render() {
    return <div>hi</div>
  }

}

export default QuestionAnswer;
