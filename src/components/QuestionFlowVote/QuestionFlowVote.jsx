import React, {Component} from 'react'
import moment from 'moment'
import { observer, inject } from "mobx-react"
import ReactMarkdown from 'react-markdown';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';


import Left from 'material-ui/svg-icons/navigation/arrow-back';
import Right from 'material-ui/svg-icons/navigation/arrow-forward';


const styles = {
  hiddenIcon: {
    display: 'none'
  },
  icon: {
    width:'20px',
    height: '20px',
    fill: '#999',
    position: 'absolute',
    top: '50%'
  }, 
  
}

@inject("UserStore")
class QuestionFlowVote extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      votingModePrivate: this.getDefHideAnswers(),
      text: this.getDefHideAnswers() ? 'privately' : 'publicly'
    }
    this.changeVoteMode = this.changeVoteMode.bind(this)
    this.getDefHideAnswers = this.getDefHideAnswers.bind(this)
  }

  changeVoteMode() {
    const newValue = !this.state.votingModePrivate
    const text = this.state.votingModePrivate ? 'publicly' : 'privately'
    this.setVotingModeState(newValue, text)
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.index !== nextProps.index) {
      const defHideAnswers = this.getDefHideAnswers()
      const text = defHideAnswers ? 'privately' : 'publicly'
      this.setVotingModeState(defHideAnswers, text)
    }
  }

  setVotingModeState(votingModePrivate, text) {
    this.setState({
      votingModePrivate: votingModePrivate,
      text: text
    })
  }

  getDefHideAnswers() {
    return this.props.UserStore.userData.get("defHideAnswers")
  }

  render() {
    const { items, index, onVote, navigateNext, getNextQuestion, getPrevQuestion, currentQuestion } = this.props
    const item = items[index];
    const { hiddenIcon, icon } = styles
    const showAnswered = !!currentQuestion.my_vote.length

    return (
       <div style={{height: '100%'}}>
          <div className="answering-mode-wrapper small">Answering <a onClick={this.changeVoteMode}>{ this.state.text }</a></div>
          {
            showAnswered && 
              <div className="answered small">
                Last answered on {moment(currentQuestion.my_vote[0].modified_at).format('DD MMMM YYYY')}
              </div>
          }

          {/*<div className="nav-buttons">*/}
            <div>
              <Left style={ Object.assign({ left:'15px', float:'left'}, (index < 1) ? hiddenIcon : icon, ) } onClick={getPrevQuestion}/>
            </div>
            <div>
              <Right style={Object.assign({ right:'15px', float: 'right' }, icon)} onClick={getNextQuestion}/>
            </div>
          {/*</div>*/}

            {item.type === "Q" && <RenderedQuestion id={item.object_id} index={index} onVote={onVote} key={"FlowTransition" + index} defHideAnswer={this.state.votingModePrivate}/>}
            {item.type === "B" && <RenderedBreak title={item.content_object.title} text={item.content_object.text} onContinue={navigateNext}/>}

        </div>
    )
  }
}

const MiddleDiv = ({children}) => (
  <div style={{ display: 'table', width: '100%', height: '70vh', overflow: 'scroll' }}>
    <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center', width: '100%', maxWidth: '400px', padding: '0 10px' }}>
      {children}
    </div>
  </div>
)

const RenderedQuestion = inject("QuestionStore")(observer(({QuestionStore, id, index, onVote, defHideAnswer}) => {

  let {question, my_vote, subtype, choices} = QuestionStore.questions.get(id)

  let myVote = null;
  if(my_vote.length > 0 && subtype === 'likert') {myVote = my_vote[0].value}
  if(my_vote.length > 0 && subtype === 'mcq') {myVote = my_vote[0].object_id}

  return (
    <MiddleDiv>
      <h1 className={"questionText questionTextFix-" + index} style={{ maxWidth: '600px', display: '-webkit-inline-box' }}>{question}</h1>
      {subtype === "likert" && <LikertButtons value={myVote} onVote={onVote} defHideAnswer={defHideAnswer}/>}
      {subtype === "mcq" && <MCQButtons value={myVote} onVote={onVote} defHideAnswer={defHideAnswer} choices={choices}/>}
    </MiddleDiv>
  )

}))

const RenderedBreak = ({title, text, onContinue}) => (
  <MiddleDiv style={{ maxWidth: '600px', display: '-webkit-inline-box' }}>
    <h1 className="questionBreak">{ title }</h1>
    <ReactMarkdown source={ text } renderers={{Link: props => <a href={props.href} target="_blank">{props.children}</a>}}/>
    <RaisedButton label="Continue" onClick={onContinue} primary />
  </MiddleDiv>
)


const LikertButtons = ({value, onVote, defHideAnswer}) => {
  let likertJSX = [];
  for (let i = 1; i <= 5; i++) {
    likertJSX.push(<div
      className={ "likertButton likertButton" + i + ( value && value !== i ? " likertButtonDimmed" : " likertButtonSelected")}
      key={i}
      onTouchTap={() => onVote(i, defHideAnswer)}></div>);
  }
  return (<div style={{overflow: 'hidden', textAlign: 'center', margin: '0 auto', marginBottom: '60px'}}>{likertJSX.map((item, index) => {return item})}</div>);
}

const MCQButtons = ({choices, value, onVote, defHideAnswer}) => (
  <div style={{paddingBottom: '50px'}}>
    {choices.map((choice, index) => {
      let activeMCQ = value === choice.id ? 'activeMCQ' : '';
      return (
        <div key={`p-${index}`} className={`mcqButton ${activeMCQ}`} onTouchTap={() => onVote(choice.id)}>
          <Checkbox style={styles.checkbox} selected={activeMCQ} />
          <span style={{ display:'inline-block', margin: '4px'}}>{choice.text}</span>
        </div>
      );
    })}
  </div>
)

const Checkbox = ({selected}) => {
  return (<div style={{float: 'left', position: 'relative', top: '2px'}}>
    {selected ? (<svg height="20" width="20" fill="#fff" viewBox="20.121 21.451 57.263 56.432" xmlns="http://www.w3.org/2000/svg">
  <path  d="M23.3,75h50V31.9c0.1,0.2,0.2,0.3,0.1,0.4c0.1-0.1,0.3-0.3,0-0.5l0.1-0.1c-0.1,0-0.2-0.1-0.3-0.2v-0.2l0,0  l0-0.3l0.2,0.1c-0.1-0.1-0.1-0.2,0-0.2c0.1,0.1,0.1,0.1,0.2,0.2c0.1-0.1,0-0.3,0-0.4c0.1-0.1,0.1,0,0.2,0.2c0.1,0,0.3-0.2,0.5-0.1  c0.1-0.2-0.1,0-0.1-0.3c0.5,0.4,0.7-0.1,0.9-0.4c-0.4-0.4,0-0.1-0.2-0.6c0,0.2,0.5,0.2,0.3,0.5l0.1-0.1c0.3,0.2-0.1,0.3,0.3,0.6  c0.1-0.1-0.1-0.7,0.2-0.6c0.1,0.4,0.1-0.2,0.3,0.2c0,0.1,0,0.1-0.1,0.2l0.1,0c0.4-0.1-0.1-0.5-0.1-0.8c0.2-0.2,0.3,0.2,0.4,0.3  c0.1,0,0.1-0.1,0.1-0.2c0,0.3-0.4-0.1-0.4-0.3c0.3,0.3,0.3-0.2,0.3-0.4c-0.6-0.2-0.2,0.1-0.8-0.1c0,0.1,0.3,0.5,0,0.4  c0-0.2-0.1-0.2-0.2-0.2c0.2,0.2-0.1,0.2-0.1,0.3c-0.1-0.1-0.2-0.5-0.4-0.5l0.3,0.5c-0.1,0-0.2-0.4-0.3-0.2C75,29,74.8,29,75,28.8  c-0.5-0.2-0.2,0.4-0.3,0.7c0,0,0-0.1,0-0.1c0,0.1,0,0.2-0.1,0.2c-0.2,0,0-0.3-0.1-0.4l-0.2,0.1c0,0,0,0,0,0c0,0.1,0,0.2-0.1,0.1  c0-0.2-0.1-0.3-0.1-0.5l0,0.4c-0.1-0.2-0.3-0.2-0.3-0.4l-0.3,0.3l-0.1-0.2V25h-50V75z M73.3,29.1C73.3,29.1,73.3,29.1,73.3,29.1  L73.3,29.1C73.3,29.1,73.3,29.1,73.3,29.1z M26.3,28h44v2.3c-0.1,0.1-0.1,0.4-0.3,0.3c0.1-0.1-0.1-0.3-0.1-0.3  c-0.1,0.2-0.4,0.3-0.4,0.7c-0.3-0.3-0.3-0.3-0.6-0.4c-0.1,0.1-0.1,0.1,0,0.3c-0.2,0-0.3,0.3-0.5,0.1c0.1,0.2-0.1,0-0.1,0.2l-0.1-0.1  l0.2,0.2c-0.5-0.3-0.2,0.5-0.7,0.2l0-0.1l0,0.1c-0.1-0.1-0.1-0.2-0.2-0.3l-0.4,0.2l0.2,0.1c-0.1,0.1,0,0.3-0.2,0.3  c0-0.4-0.1,0.1-0.3-0.1l0-0.1c-0.1,0.1-0.1,0.1,0,0.3c-0.1,0.2-0.4-0.3-0.4,0l0.1-0.1c0.1,0.1,0.2,0.3,0.1,0.4c0,0-0.2-0.1-0.1-0.1  c-0.1,0.2-0.3,0.2-0.3,0.3c-0.1,0-0.2-0.2-0.2-0.3c-0.1,0.4-0.1,0-0.3,0.4l-0.1-0.1l0,0.2l-0.3-0.2l0.2,0.1  c-0.1,0.1-0.1,0.2-0.2,0.2l-0.1-0.2c-0.2,0.3-0.5-0.1-0.5,0.3c0,0,0-0.1,0-0.1c0,0.4-0.4-0.2-0.4,0.3c0-0.1-0.1-0.1-0.1-0.2l0,0.2  L64,32.8l0.2,0.4L63.9,33l0,0.1c-0.4-0.4-0.3,0.1-0.7-0.2l0.2,0.3c0.1,0.9-1.1,0.2-1.3,0.8L62,33.9l0,0.4c-0.2-0.1-0.1-0.2-0.2-0.3  c-0.1,0.3,0.2,0.4,0,0.6c-0.2-0.1-0.1-0.2-0.1-0.3c-0.1,0.3-0.3,0.6-0.6,0.6c0,0,0,0.1,0.1,0.1c-0.1,0.2-0.3,0.2-0.5,0.4  c-0.1-0.1,0-0.2,0-0.2c-0.1,0-0.2,0-0.2,0.1L60.4,35c-0.1,0-0.2,0.4-0.4,0.2c0.1,0.1,0.2,0.3,0.1,0.3c-0.3-0.3-0.2,0.3-0.5,0.3  c0-0.1,0.1-0.2,0-0.2c-0.2,0-0.1,0.2-0.1,0.3l-0.1-0.2l-0.2,0.5c-0.3-0.3-0.3,0.3-0.5,0c-0.1,0.1,0.2,0.1,0.1,0.2  c-0.2-0.1-0.1,0.2-0.3-0.1l0,0l-0.1,0.1l-0.1-0.3c-0.1,0.1,0,0.4,0.1,0.6c-0.2-0.1-0.3,0.2-0.4,0l0-0.1c-0.2,0.3-0.9-0.3-0.8,0.3  c0,0-0.1-0.1,0-0.1L57,37l-0.1-0.2l-0.1,0.5l-0.1-0.1c-0.2,0.1-0.5,0.4-0.7,0.6l0-0.1c-0.1,0.4-0.3,0.1-0.4,0.3c0,0,0-0.1,0-0.1  L55.5,38l0-0.1c0.1,0.3-0.6-0.1-0.4,0.1c0,0.2,0,0.4,0.1,0.5c-0.2,0.2-0.2-0.1-0.3-0.1c-0.1,0.1,0,0.3-0.3,0.3l-0.1-0.1  c-0.1,0.1-0.1,0.2-0.2,0.3l0-0.1c0,0.4-0.5-0.2-0.3,0.5c-0.2,0-0.2,0.2-0.4-0.1c-0.1,0.3-0.3,0.5-0.4,0.8c-0.3-0.3,0,0.1-0.3,0  l0.2,0.2c-0.3,0.3-1.1,0.1-1.4,0.5l-0.2-0.2l0.1,0.3c-0.5,0.2-1,0.5-1.4,0.8c0,0.2,0,0.5-0.2,0.6l0,0c-0.2,0.3-0.4,0.7-0.8,0.8  c0-0.1-0.1-0.1-0.1-0.2c0.1,0.3-0.2,0.2-0.2,0.2l0.2,0.1c0.1,0.3-0.2,0.2-0.4,0.1l0,0.3c0,0-0.1,0-0.1-0.1l0.1,0.1l-0.3-0.2  c0,0.1-0.1,0.3,0,0.6c-0.1-0.1-0.3,0-0.2-0.2l-0.3,0.2c-0.2,0.1-0.3-0.1-0.2-0.3c-0.5,0.5-0.2-0.4-0.6,0l0.1-0.3  c-0.1,0.1-0.3,0.4-0.4,0.3c0-0.2,0.2-0.4,0.2-0.5l-0.4,0.4c-0.1-0.8-1-1-1.2-1.7c-0.3-0.1-0.7-0.1-1-0.3l0.1,0l-0.2-0.3l0,0.3  c-0.1,0-0.2,0.1-0.3,0c-0.2-0.4-0.4-0.9-0.9-0.9c-0.6,0.3,0.2-0.6-0.3-0.3c0.1,0,0.1-0.1,0.2-0.1c-0.4,0-0.6,0-1,0.1  c0.4-0.5-0.2-0.1,0-0.3L41.9,40c0-0.2-0.1-0.3,0.1-0.4l-0.3,0.2l0.1-0.2c-0.1-0.1-0.6-0.2-0.3-0.6c-0.6,0.1-1.1-0.4-1.4-0.8  c-0.2,0.1-0.3,0.1-0.4,0l0.1-0.3c-0.2,0-0.5,0.2-0.5,0c0,0,0,0,0.1-0.1c-0.1,0-0.1-0.2-0.4-0.1c-0.1-0.1-0.1-0.3,0.1-0.5  c-0.3,0.4-0.2-0.2-0.2-0.2s-2.2-2.1-4.6-3.1l-1.1,2c0-0.2-0.1-0.3-0.2-0.4l-2,3.6c0.1,0.1,0.1,0.1,0.2,0.1c-0.1,0.3-0.1,0.1-0.3,0.2  c0.1,0,0.2,0,0.2,0.1l-0.8,1.5c0.7,0.2,1.4,0.3,2,0.3c0.1,0.1,0.1,0.1,0.1,0.2l0-0.2c0,0,0,0,0.1,0c0.1,0,0.2,0,0.3,0  c-0.1,0.1-0.3,0.3-0.1,0.3c0-0.1,0-0.2,0.1-0.3c0.1,0.7,1,1.1,1.4,1.8c0.9,0.4,1.6,1.4,2.5,1.8c-0.1-0.1,0.2-0.5,0.2-0.3  c-0.3,0.9,0.5,0.2,0.4,0.9c0.6,0.1,0.6,1,1.5,0.8l-0.1,0.2c0,0.1,0.1,0,0.2,0l0,0.1c0.1,0.2,0.5,0.1,0.5,0.3l0.2-0.2  c0.1,0-0.1,0.2,0.1,0.2l-0.1,0.1l0.3-0.1c-0.3,0.4,0.2,0.2,0.2,0.5c0.2,0,0.5,0,0.7,0.2c-0.1,0.2,0.1,0.4,0.2,0.6  c0.3,0.1,0.7,0.4,1,0.7c-0.3,0.1-0.5,0.3-0.6,0.6c0.1,0.7-0.5-0.3-0.5,0.3c0-0.1-0.1-0.1-0.1-0.2c-0.1,0.4-0.2,0.6-0.2,1.1  c-0.4-0.5-0.2,0.2-0.4-0.1l0.1,0.2c-0.2-0.1-0.3,0-0.4-0.1l0.1,0.3l-0.2-0.2c-0.2,0.1-0.4,0.6-0.8,0.3c-0.1,0.6-0.8,1.1-1.4,1.5  c0.1,0.2-0.1,0.4-0.2,0.5l-0.3-0.1c0,0.2,0.1,0.6-0.1,0.5c0,0,0,0,0-0.1c-0.1,0.1-0.3,0.1-0.2,0.4c-0.1,0.1-0.4,0.1-0.5-0.2  c0.3,0.4-0.3,0.2-0.3,0.2s-1.8,1.2-3.5,2.9c-1.7,1.7-3.4,3.9-3.2,5.6c0.1,0.2,0.1,0.5,0.4,0.6c0,0.2-0.4-0.1-0.2,0.1  c0.3,0,0.4,0.5,0.8,0.6l0,0.1c0.1,0.1,0-0.3,0.2,0L30,63.2c0.1,0,0.2,0,0.4,0.1c-0.1-0.2-0.5-0.7-0.1-0.7l0,0.1  c0.1-0.1,0.3,0.1,0.4,0.2l0,0l0.3,0.1c-0.2,0-0.1,0.4,0,0.3c0.3-0.1-0.1,0,0-0.2c0.1-0.1,0.2,0.1,0.3,0.2l0.1-0.1  c0.1,0.2-0.1,0.1,0.1,0.2l0-0.3c0.4,0.4,0-0.4,0.4-0.1c0,0.2,0.1,0.1,0.2,0.3l0.3-0.3c0.1,0,0,0.2,0.1,0.1c0.2,0.1,0-0.2,0-0.2  c0.1,0.1,0.2-0.2,0.5,0c0.4,0-0.2-0.4,0.1-0.4c0.2,0.1-0.1,0.2,0.1,0.3l0.1-0.2c0.1,0.1,0.2,0.3,0.1,0.3c0.7-0.3,1.8,0.3,2.1-0.4  c0.3,0.1,0.1,0.2,0.1,0.3c0.1-0.6,0.9-0.1,1.2-0.4L36.6,62c0.9,0.1,1.1-0.7,1.8-0.9l-0.2-0.1c-0.1-0.2,0-0.3,0-0.5  c0.1,0.1,0.3,0.4,0.3,0.2c-0.1,0-0.2,0-0.3-0.1c0.8,0,1.6-0.9,2.4-1.3c0.8-1,2.1-1.5,2.9-2.5c-0.1,0.1-0.4-0.3-0.2-0.3  c0.9,0.4,0.4-0.6,1.1-0.3c0.3-0.7,1.3-0.5,1.4-1.5L46,55c0.2,0,0.1-0.1,0.1-0.2l0,0.1c0.2-0.1,0.3-0.5,0.5-0.5l-0.2-0.2  c0.1-0.1,0.2,0.1,0.2-0.1l0.1,0.1l0-0.3c0.3,0.4,0.3-0.2,0.6-0.1c0.1-0.2,0.2-0.6,0.5-0.7c0.1,0.1,0.2,0.1,0.4,0L48,53.3l0.2,0  c0,0.2-0.2,0-0.2,0.2l0.2-0.2c-0.1,0.2,0.2,0.3-0.2,0.5l0.5,0.4c0.1,0.1,0.3-0.3,0.4-0.1c-0.1,0.1-0.1,0-0.2,0.2  c0.1,0.6,1-0.4,1.2,0l-0.1,0c0.1-0.1,0.2,0,0.3,0c0.3-0.4-0.2,0.2-0.1-0.1c0.3-0.3,0.3-0.1,0.5-0.3c0,0.2,0.2,0,0.3,0.1  c-0.1,0.3,0.2,0.3,0.1,0.6c0.1-0.1,0.5-0.3,0.6-0.3c-0.1,0.3-0.2,0.2-0.2,0.4l0.2-0.2c0.1,0.1,0,0.1-0.1,0.2c0.1,0.1,0.3-0.2,0.3,0  l-0.2,0.1c0.2,0,0.2,0.1,0.3,0.2c-0.1,0.1-0.1,0.1-0.2,0c-0.2,0.3,0.2,0,0.2,0c0.1-0.1,0-0.2,0.2-0.4c0,0.1,0.4-0.1,0.2,0.1  l-0.2,0.1c0.3,0,0.3-0.2,0.4,0c0,0-0.1,0.1-0.1,0.1c0.3-0.2,0.2,0.2,0.4,0.3l-0.1,0c0.1,0,0.3-0.2,0.3-0.1c0-0.2,0.1-0.2,0.2-0.4  c-0.2,0.4,0.5-0.2,0.5,0.1c-0.1,0.1-0.3,0.2-0.2,0c-0.3,0.3-0.6,0.5-0.8,0.6c0.1,0,0.2,0,0.1,0.1l0.3-0.3c0,0,0.1,0.1,0.1,0.1  c0.2-0.2,0.2-0.4,0.4-0.4c0.2,0-0.2,0.4-0.1,0.2c0.2,0,0.3-0.3,0.4-0.1c0,0-0.1,0-0.1,0c0,0.2,0.3,0.2,0,0.5  c-0.1,0.1-0.2,0.2-0.2,0.1l0-0.1c-0.3,0.2,0.2,0-0.2,0.3c0.2-0.2,0.3,0,0.3,0.1l0.2-0.2c0.8-0.5-0.4,0.4-0.1,0.5  c0.3,0,0-0.1,0.2-0.2c0.1,0.1-0.1,0.3,0.1,0.4c0,0.1-0.1,0.3-0.3,0.6c0.2,0,0.1,0.3,0.4,0.1c0-0.3-0.4,0.1-0.2-0.3l0.3-0.2  c0.1,0.1,0.3,0.1,0.3,0.3c0-0.1,0.1-0.1,0.1-0.2c0.2,0,0.5-0.2,0.6,0C55,57.2,55,57.1,54.9,57c-0.1,0.3,0.1,0.1,0.2,0.3  c-0.2,0.2-0.1-0.1-0.3,0.1l0.2,0.1c0,0,0,0,0,0c0.3-0.3,0.1,0.1,0.3,0.1c0.2,0.2,0.7-0.2,1-0.3c0,0.1-0.1,0.2-0.2,0.3  c0.1-0.2,0-0.1-0.1,0c0.1,0-0.1,0.5-0.3,0.6c0.2,0,0.1-0.2,0.3-0.2l0.2,0.2c0.1-0.2,0.1-0.3,0.3-0.3c0.1,0,0.1,0.1,0.2,0.2  c-0.1,0.1-0.2,0.3-0.3,0.2c0,0.1,0.1,0.2,0.2,0c0-0.2,0.3,0,0.4-0.3l0,0.2c0,0-0.1,0.1-0.1,0c-0.2,0.3,0.2,0,0.2,0  c0,0.1,0.1,0.2,0,0.3c0.1,0,0.1,0.1,0,0.2c0.1,0,0.1-0.2,0.2-0.2l0.2,0.2c-0.1,0.1-0.4,0.5-0.5,0.6c0.2-0.1,0.4-0.4,0.5-0.3  c-0.3,0.2-0.1,0.3-0.4,0.6c-0.1,0.2,0.1,0.4,0.2,0.4c0.2-0.2,0-0.2,0.2-0.4c0.3,0.2,0.9-0.4,1-0.2l0-0.1c0.2,0,0.2,0,0.4-0.1  c-0.3,0.2-0.5,0.8-0.3,0.9c0.1-0.1,0.1-0.4,0.3-0.5l0.2,0.1c0,0-0.1,0.1-0.1,0.1c0.2,0-0.1,0.5,0.2,0.3L59,60.5l0.1-0.2  c0.1-0.1,0.3,0,0.4-0.1c0.3,0,0.2,0.1,0.1,0.4c0.1-0.1,0.2-0.4,0.4-0.4c-0.4,0.4,0.1,0.4-0.1,0.6c0,0,0,0.2,0.2,0.1l-0.3,0.3  c0.4-0.4,0.5-0.2,0.7-0.2c-0.5,0.5,0.2,0.1-0.2,0.6c0.3-0.3,0.3,0.1,0.6-0.2c0.1,0.1-0.2,0.4-0.3,0.5l0.2-0.1c-0.1,0.2,0,0.4,0,0.6  l0.4-0.2L61,62.2c0.1-0.1,0.2,0,0.3-0.2l0,0.1c0.3-0.3,0.2,0,0.4-0.1c0,0.1-0.1,0.1-0.2,0.2c0,0-0.1,0.2-0.2,0.3  c0-0.1,0.7-0.4,0.7-0.7c0.1-0.1,0.3-0.2,0.3-0.1l-0.2,0.3l0.3-0.3c0.1,0,0,0.2,0,0.3c-0.1,0-0.7,0.4-0.5,0.6c-0.1,0-0.3,0.1-0.4,0.1  c0,0,0,0.1-0.2,0.2c0.2,0,0.2-0.1,0.4-0.1c-0.3,0.3-0.3,0.4-0.3,0.6l0.1-0.3c0,0,0.1,0,0.1-0.1c0-0.1,0-0.1,0.1-0.2  c0,0,0.5-0.2,0.3,0c0.3-0.5,0.5-0.1,0.7-0.4c0.1-0.1,0.2,0,0.1,0.1c-0.3,0.1-0.2,0.4-0.4,0.5c0.1,0,0.1-0.3,0.2-0.3  c0.1,0,0,0.2-0.1,0.4l-0.1,0l0,0.2c0.1-0.1,0.1-0.3,0.3-0.3c0,0.1,0.1,0.1,0,0.2c-0.2,0.1-0.4,0.4-0.5,0.4c0.1,0,0.3,0.2,0.5-0.1  l0.1,0.1c0.1-0.2,0.1-0.5,0.3-0.4L63,63.4l0.3-0.1l-0.1,0.2c0.1-0.1,0.1-0.1,0.2-0.1c-0.1,0.1-0.1,0.2-0.2,0.3  c0.1,0.1,0.2,0,0.3-0.1c0.1,0,0,0.1-0.1,0.2c0.1,0.1,0.2,0.2,0.2,0.4c0.2,0,0-0.1,0.3-0.2c-0.3,0.5,0.2,0.5,0.4,0.7  c0.3-0.4,0.1,0,0.5-0.3c-0.2,0.1-0.1,0.5-0.4,0.4l0.1,0.1c-0.1,0.3-0.3,0-0.5,0.4c0.1,0.1,0.6-0.3,0.6,0c-0.3,0.2,0.2,0-0.1,0.3  c-0.1,0.1-0.1,0-0.2,0l0,0.1c0.2,0.3,0.4-0.3,0.7-0.3c0.2,0.1-0.1,0.3-0.2,0.5c0,0.1,0.1,0.1,0.2,0.1c-0.3,0.1,0-0.3,0.2-0.5  c-0.2,0.4,0.2,0.2,0.4,0.2c0.1-0.5-0.1-0.2,0-0.7c-0.1,0.1-0.4,0.4-0.4,0.1c0.2-0.1,0.2-0.2,0.2-0.2c-0.1,0.2-0.1,0-0.3,0  c0.1-0.2,0.4-0.3,0.4-0.5l-0.4,0.4c0-0.1,0.3-0.3,0.1-0.3c0.3-0.1,0.3-0.3,0.5-0.3c0.2-0.5-0.4-0.1-0.7,0c0,0,0.1-0.1,0.1-0.1  c-0.1,0.1-0.2,0-0.2,0c0-0.2,0.2-0.1,0.3-0.2l-0.1-0.1c0,0,0,0,0,0c-0.1,0-0.2,0-0.1-0.1c0.2-0.1,0.3-0.2,0.4-0.3L65,63.3  c0.1-0.1,0.1-0.3,0.3-0.3l-0.3-0.2l0.2-0.3c-0.1,0-0.1,0-0.1,0.1c0-0.1-0.8,0.1-0.2-0.3c-0.4,0.1-0.4-0.1-0.7-0.1  c0.4-0.1,0.1-0.5,0.4-0.4c0-0.2-0.3,0.1-0.4,0c0-0.2,0.3-0.4,0.5-0.4l-0.2,0l0.1-0.1l-0.2,0.1c0.1-0.2,0.2-0.3,0.2-0.4l-0.2,0.2  l0.1-0.2c-0.1,0.1-0.2,0.1-0.3,0.1l0.1-0.1l-0.1,0c0.2-0.1,0-0.1,0.2-0.3c-0.1-0.1-0.1-0.1-0.2-0.1l-0.1,0.2c-0.3,0,0.2-0.2,0.1-0.4  l-0.2,0.2c0.1-0.5-0.5-0.1-0.4-0.4c0.1,0,0.3-0.2,0.2-0.2c-0.2,0-0.3-0.3-0.6-0.2c0.2-0.3,0.3-0.4,0.3-0.6c-0.1-0.1-0.1-0.1-0.3,0.1  c0-0.2-0.3-0.2-0.1-0.4c-0.2,0.1,0-0.1-0.2,0l0.1-0.1l-0.2,0.2c0.2-0.6-0.5,0-0.3-0.5l0.1,0l-0.1,0c0.1-0.1,0.1-0.1,0.2-0.2L62.1,58  l-0.1,0.2c-0.1,0-0.3,0.1-0.3-0.1c0.4-0.2-0.1-0.1,0.1-0.3l0.1,0c-0.1-0.1-0.1-0.1-0.3,0.1c-0.2,0,0.2-0.4,0-0.3l0.1,0.1  c-0.1,0.1-0.3,0.2-0.3,0.2c0,0,0.1-0.2,0.1-0.1c-0.2,0-0.2-0.2-0.3-0.2c0-0.1,0.1-0.2,0.2-0.2c-0.3,0-0.1-0.1-0.4-0.1l0.1-0.1  L61,57.1l0.1-0.3L61,56.9c-0.1,0-0.2,0-0.2-0.1l0.2-0.1c-0.3-0.1,0-0.5-0.3-0.4c0,0,0.1-0.1,0.1-0.1c-0.4,0.1,0.1-0.4-0.3-0.2  c0.1,0,0.1-0.1,0.1-0.2l-0.2,0l0.2-0.2l-0.3,0.3l0.2-0.3l-0.1,0.1c0.3-0.5-0.1-0.3,0.1-0.7l-0.2,0.3c-0.8,0.3-0.3-0.9-0.9-0.9  l0.2-0.2l-0.4,0.1c0.1-0.2,0.2-0.1,0.3-0.3c-0.3,0-0.3,0.3-0.6,0.2c0-0.2,0.2-0.1,0.3-0.2c-0.3,0-0.6-0.1-0.6-0.3  c0,0-0.1,0.1-0.1,0.1c-0.2,0-0.2-0.2-0.4-0.3c0.1-0.1,0.1-0.1,0.2-0.1c0-0.1,0-0.2-0.2-0.1l0.2-0.1c-0.1-0.1-0.4-0.1-0.2-0.3  c-0.1,0.1-0.2,0.3-0.3,0.2c0.2-0.4-0.3,0-0.3-0.3c0.1-0.1,0.2,0,0.2,0c0-0.1-0.2,0-0.3,0l0.1-0.1L57,52.5c0.2-0.4-0.3-0.2-0.1-0.4  c-0.1-0.1,0,0.2-0.2,0.1c0.1-0.2-0.2,0,0-0.2l0,0l-0.1-0.1l0.2-0.2c-0.1,0-0.4,0.1-0.5,0.3c0-0.2-0.2-0.2,0-0.4l0.1,0  c-0.3-0.1,0.1-0.9-0.3-0.7c0,0,0.1-0.1,0.1-0.1l-0.1-0.1l0.2-0.1l-0.4,0.1l0.1-0.1c-0.1-0.2-0.4-0.3-0.6-0.4l0.1,0  c-0.3,0-0.1-0.3-0.4-0.3c0,0,0,0,0.1,0l-0.1-0.1l0.1-0.1c-0.3,0.2,0-0.6-0.1-0.3c-0.1,0.1-0.3,0.1-0.5,0.2c-0.2-0.1,0.1-0.2,0.1-0.3  c-0.1-0.1-0.3,0.1-0.3-0.1l0.1-0.1c-0.1,0-0.2,0-0.3,0l0.1,0c-0.3,0.1,0.1-0.5-0.4-0.1c0,0,0,0,0-0.1c0,0,0,0,0,0c0,0,0,0,0,0  c0-0.1-0.1-0.1,0-0.3c0.2-0.1,0.3-0.2,0.5-0.3c0,0.1,0.1,0.1,0.1,0.2c-0.1-0.4,0.3,0.1,0.5-0.1c0.5-0.5,1-1.4,1.6-1.8  c-0.1-0.4,0.1-0.5,0.2-0.8l0.3,0.4l0-0.2c0.2,0.1-0.1,0.2,0.2,0.2l-0.1-0.3c0.1,0.1,0.5-0.2,0.4,0.3l0.6-0.4c0.1-0.1-0.2-0.4,0-0.4  c0.1,0.1,0,0.1,0.1,0.3c0.7,0-0.1-1.2,0.4-1.3l0,0.1c0-0.2,0.1-0.2,0.1-0.3c-0.4-0.4,0.1,0.3-0.2,0.1c-0.3-0.4,0-0.3-0.2-0.6  c0.2,0.1,0.1-0.2,0.2-0.3c0.3,0.1,0.4-0.2,0.7,0c0-0.2-0.2-0.6-0.1-0.7c0.3,0.2,0.2,0.3,0.4,0.3l-0.1-0.2c0.1-0.1,0.2,0,0.2,0.1  c0.1-0.1-0.1-0.4,0.2-0.3l0.1,0.3c0.1-0.2,0.1-0.2,0.3-0.3c0.1,0.1,0,0.2-0.1,0.2c0.3,0.2,0.1-0.2,0.1-0.2c-0.1-0.1-0.2,0-0.3-0.3  c0.1,0,0-0.4,0.2-0.2L60,42c0.1-0.3-0.1-0.3,0.2-0.4c0,0,0,0.1,0.1,0.1c-0.1-0.3,0.3-0.2,0.5-0.4l0,0.1c0-0.1-0.1-0.3,0-0.3  c-0.2,0-0.2-0.1-0.4-0.3c0.4,0.2-0.1-0.5,0.3-0.5c0.1,0.1,0.1,0.3,0,0.2c0.2,0.4,0.4,0.7,0.4,1c0-0.1,0.1-0.3,0.2-0.1l-0.2-0.3  c0,0,0.1-0.1,0.1-0.1c-0.1-0.2-0.3-0.3-0.3-0.5c0.1-0.2,0.3,0.3,0.2,0.1c0.1-0.3-0.2-0.4,0.1-0.4c0,0,0,0.1,0,0.1  c0.2,0,0.3-0.3,0.6,0.1c0,0.1,0.1,0.2,0.1,0.2l0-0.1c0.1,0.4,0.1-0.2,0.3,0.2c-0.2-0.2,0.1-0.3,0.2-0.3l-0.2-0.2  c-0.2-0.9,0.3,0.5,0.5,0.2c0.1-0.3-0.1,0-0.1-0.3c0.1,0,0.3,0.1,0.4-0.1c0.1,0.1,0.3,0.1,0.5,0.4c0-0.2,0.4-0.1,0.3-0.4  c-0.3-0.1,0,0.4-0.4,0.2l-0.1-0.3c0.2-0.1,0.2-0.3,0.4-0.3c-0.1,0-0.1-0.1-0.1-0.2c0.1-0.2,0-0.5,0.3-0.6c0.2,0.2,0.1,0.3,0,0.3  c0.3,0.1,0.1-0.1,0.4-0.1c0.2,0.2-0.1,0.1,0,0.3l0.2-0.2c0,0,0,0,0,0c-0.2-0.4,0.2-0.1,0.2-0.3c0.3-0.2,0-0.7,0-1.1  c0.1,0.1,0.2,0.1,0.2,0.2c-0.2-0.1-0.1,0-0.1,0.1c0.1-0.1,0.5,0.2,0.5,0.4c0.1-0.2-0.2-0.1-0.2-0.3L65,38c-0.2-0.2-0.3-0.1-0.2-0.4  c0.1-0.1,0.1-0.1,0.3-0.2c0,0.1,0.2,0.2,0.1,0.3c0.1,0,0.2,0,0.1-0.2c-0.3-0.1,0.1-0.3-0.2-0.5l0.3,0.1c0,0,0,0.1,0,0.1  c0.2,0.2,0.1-0.2,0.1-0.2c0.1,0,0.2-0.1,0.3,0c0-0.1,0.1-0.1,0.3,0c0-0.1-0.1-0.2-0.2-0.3l0.3-0.1c0.1,0.1,0.4,0.5,0.4,0.6  c0-0.2-0.3-0.5-0.1-0.5c0.1,0.3,0.3,0.1,0.5,0.5c0.2,0.2,0.4,0,0.5-0.2c-0.1-0.3-0.2,0-0.4-0.3c0.3-0.3-0.2-1,0.2-1.1l-0.1,0  c0.1-0.2,0.1-0.2,0-0.5c0.2,0.3,0.7,0.7,0.9,0.4c-0.1-0.2-0.3-0.2-0.5-0.4l0.1-0.2c0,0,0,0.1,0,0.1c0.1-0.2,0.6,0.2,0.4-0.2l0.5,0.3  l-0.2-0.1c-0.1-0.2,0.1-0.3,0.1-0.4c0.1-0.3,0.2-0.2,0.4-0.1c-0.1-0.1-0.4-0.3-0.3-0.5c0.3,0.5,0.4,0,0.6,0.2c0.1,0,0.3,0,0.1-0.2  l0.2,0.3c-0.3-0.4-0.1-0.5,0.1-0.7c0.3,0.6,0.1-0.2,0.6,0.3c-0.2-0.4,0.2-0.3,0-0.7c0,0,0.1,0,0.1,0V72h-44V28z M47.7,44  C47.7,44.1,47.7,44.1,47.7,44c0,0.1,0,0.1,0,0.2C47.6,44.2,47.6,44.1,47.7,44L47.7,44z M42.3,48.5c-0.1,0-0.1,0-0.2,0.1L42.3,48.5  L42.3,48.5C42.3,48.5,42.3,48.5,42.3,48.5z"/>
  <path  d="M60.7,35c0,0.1,0,0.1,0,0.1C60.7,35.1,60.7,35,60.7,35z"/>
  <path  d="M73.7,31.4l-0.2-0.1C73.5,31.3,73.6,31.4,73.7,31.4z"/>
  <path  d="M74.3,29.2c0,0,0,0.1,0,0.1C74.3,29.2,74.3,29.2,74.3,29.2z"/>
  <path  d="M29.3,62.4l0-0.3C29.2,62.1,29.3,62.3,29.3,62.4z"/>
  <path  d="M30.4,63.3C30.4,63.3,30.4,63.3,30.4,63.3C30.4,63.3,30.4,63.3,30.4,63.3L30.4,63.3z"/>
  <path  d="M41.3,49.3L41.3,49.3C41.3,49.2,41.3,49.2,41.3,49.3L41.3,49.3z"/>
  <path  d="M40.8,49.4c0,0,0-0.1,0-0.1C40.7,49.3,40.7,49.3,40.8,49.4z"/>
  <path  d="M61.1,34.8C61.1,34.8,61.1,34.8,61.1,34.8C61.1,34.8,61.1,34.8,61.1,34.8z"/>
  <polygon  points="61.1,41 61.1,41 61.1,41 "/>
  <path  d="M61.1,40.7c-0.1,0-0.1,0.2,0,0.3C61.1,40.9,61.1,40.9,61.1,40.7z"/>
  <polygon  points="64,39.2 64,39.2 64,39.2 "/>
  <polygon  points="59.5,42.7 59.5,42.7 59.5,42.7 "/>
  <path  d="M64.1,39.2l-0.1,0c0,0.1,0.1,0.1,0.1,0.2L64.1,39.2z"/>
  <path  d="M59.5,42.7c0,0,0.1,0.1,0.2,0.2C59.6,42.8,59.5,42.7,59.5,42.7z"/>
  <path  d="M67.8,35.1L67.8,35.1C67.8,35.3,67.9,35.2,67.8,35.1z"/>
  <path  d="M69.4,34.6c0-0.1-0.1-0.2-0.1-0.2C69.2,34.4,69.3,34.5,69.4,34.6z"/>
  <path  d="M64.3,60.8L64.3,60.8c0,0,0,0.1,0.1,0.1L64.3,60.8z"/>
  <path  d="M58.3,53.4c0,0-0.1,0-0.1,0C58.2,53.4,58.3,53.4,58.3,53.4z"/>
  <path  d="M63.3,63.5c-0.1,0.1-0.1,0.1-0.1,0.2L63.3,63.5z"/>
  <path  d="M65.2,63.5c0,0-0.1,0-0.1,0C65.2,63.5,65.2,63.6,65.2,63.5z"/>
  <path  d="M62,63.2c-0.2,0.1-0.1-0.2-0.2,0C61.8,63.2,61.8,63.4,62,63.2z"/>
  <path  d="M43.2,40.5L43.2,40.5C43.2,40.5,43.3,40.5,43.2,40.5L43.2,40.5z"/>
  <path  d="M43.1,40c0,0,0.1,0,0.1,0C43.2,39.9,43.1,40,43.1,40z"/>
  <path  d="M58.5,53.7C58.5,53.7,58.5,53.7,58.5,53.7C58.5,53.7,58.5,53.7,58.5,53.7z"/>
  <polygon  points="53,55.5 53,55.5 53,55.5 "/>
  <path  d="M53.3,55.4c0-0.1-0.2,0-0.3,0.1C53,55.5,53.1,55.5,53.3,55.4z"/>
  <polygon  points="55,57.6 55,57.5 55,57.5 "/>
  <polygon  points="51.3,54.6 51.3,54.6 51.3,54.6 "/>
  <path  d="M55,57.6L55,57.6c-0.1,0-0.1,0-0.2,0L55,57.6z"/>
  <path  d="M51.3,54.6c0,0-0.1,0.1-0.1,0.2C51.2,54.8,51.2,54.7,51.3,54.6z"/>
  <path  d="M61.4,62.2L61.4,62.2C61.3,62.1,61.3,62.1,61.4,62.2L61.4,62.2z"/>
  <path  d="M61.5,62.8C61.5,62.8,61.5,62.8,61.5,62.8C61.4,62.8,61.5,62.8,61.5,62.8z"/>
  <path  d="M59.1,59.7C59,59.7,59,59.7,59.1,59.7C58.9,59.8,59,59.7,59.1,59.7z"/>
  <path  d="M60.8,62.3C60.8,62.3,60.8,62.3,60.8,62.3L60.8,62.3L60.8,62.3z"/>
  <path  d="M61.7,63.2C61.7,63.2,61.7,63.2,61.7,63.2C61.6,63.2,61.6,63.2,61.7,63.2C61.7,63.2,61.7,63.2,61.7,63.2z"/>
  <path  d="M59.7,60.9c0.1-0.1,0.1-0.1,0.2-0.2C59.8,60.7,59.8,60.8,59.7,60.9z"/>
</svg>

    ) :
    (<svg height="20" width="20" fill="#444" viewBox="20.121 21.451 57.263 56.432" xmlns="http://www.w3.org/2000/svg">
    <path d="M 23.3 75 L 73.3 75 L 73.4 25 L 23.4 25 L 23.4 75 L 23.3 75 Z M 26.3 28 L 70.3 28 L 70.3 72 L 26.3 72 L 26.3 28 L 26.3 28 Z" />
    <path d="M60.7,35c0,0.1,0,0.1,0,0.1C60.7,35.1,60.7,35,60.7,35z" />
    <path d="M73.7,31.4l-0.2-0.1C73.5,31.3,73.6,31.4,73.7,31.4z" />
    <path d="M74.3,29.2c0,0,0,0.1,0,0.1C74.3,29.2,74.3,29.2,74.3,29.2z" />
    <path d="M29.3,62.4l0-0.3C29.2,62.1,29.3,62.3,29.3,62.4z" />
    <path d="M30.4,63.3C30.4,63.3,30.4,63.3,30.4,63.3C30.4,63.3,30.4,63.3,30.4,63.3L30.4,63.3z" />
    <path d="M41.3,49.3L41.3,49.3C41.3,49.2,41.3,49.2,41.3,49.3L41.3,49.3z" />
    <path d="M40.8,49.4c0,0,0-0.1,0-0.1C40.7,49.3,40.7,49.3,40.8,49.4z" />
    <path d="M61.1,34.8C61.1,34.8,61.1,34.8,61.1,34.8C61.1,34.8,61.1,34.8,61.1,34.8z" />
    <polygon points="61.1,41 61.1,41 61.1,41 " />
    <path d="M61.1,40.7c-0.1,0-0.1,0.2,0,0.3C61.1,40.9,61.1,40.9,61.1,40.7z" />
    <polygon points="64,39.2 64,39.2 64,39.2 " />
    <polygon points="59.5,42.7 59.5,42.7 59.5,42.7 " />
    <path d="M64.1,39.2l-0.1,0c0,0.1,0.1,0.1,0.1,0.2L64.1,39.2z" />
    <path d="M59.5,42.7c0,0,0.1,0.1,0.2,0.2C59.6,42.8,59.5,42.7,59.5,42.7z" />
    <path d="M67.8,35.1L67.8,35.1C67.8,35.3,67.9,35.2,67.8,35.1z" />
    <path d="M69.4,34.6c0-0.1-0.1-0.2-0.1-0.2C69.2,34.4,69.3,34.5,69.4,34.6z" />
    <path d="M64.3,60.8L64.3,60.8c0,0,0,0.1,0.1,0.1L64.3,60.8z" />
    <path d="M58.3,53.4c0,0-0.1,0-0.1,0C58.2,53.4,58.3,53.4,58.3,53.4z" />
    <path d="M63.3,63.5c-0.1,0.1-0.1,0.1-0.1,0.2L63.3,63.5z" />
    <path d="M65.2,63.5c0,0-0.1,0-0.1,0C65.2,63.5,65.2,63.6,65.2,63.5z" />
    <path d="M62,63.2c-0.2,0.1-0.1-0.2-0.2,0C61.8,63.2,61.8,63.4,62,63.2z" />
    <path d="M43.2,40.5L43.2,40.5C43.2,40.5,43.3,40.5,43.2,40.5L43.2,40.5z" />
    <path d="M43.1,40c0,0,0.1,0,0.1,0C43.2,39.9,43.1,40,43.1,40z" />
    <path d="M58.5,53.7C58.5,53.7,58.5,53.7,58.5,53.7C58.5,53.7,58.5,53.7,58.5,53.7z" />
    <polygon points="53,55.5 53,55.5 53,55.5 " />
    <path d="M53.3,55.4c0-0.1-0.2,0-0.3,0.1C53,55.5,53.1,55.5,53.3,55.4z" />
    <polygon points="55,57.6 55,57.5 55,57.5 " />
    <polygon points="51.3,54.6 51.3,54.6 51.3,54.6 " />
    <path d="M55,57.6L55,57.6c-0.1,0-0.1,0-0.2,0L55,57.6z" />
    <path d="M51.3,54.6c0,0-0.1,0.1-0.1,0.2C51.2,54.8,51.2,54.7,51.3,54.6z" />
    <path d="M61.4,62.2L61.4,62.2C61.3,62.1,61.3,62.1,61.4,62.2L61.4,62.2z" />
    <path d="M61.5,62.8C61.5,62.8,61.5,62.8,61.5,62.8C61.4,62.8,61.5,62.8,61.5,62.8z" />
    <path d="M59.1,59.7C59,59.7,59,59.7,59.1,59.7C58.9,59.8,59,59.7,59.1,59.7z" />
    <path d="M60.8,62.3C60.8,62.3,60.8,62.3,60.8,62.3L60.8,62.3L60.8,62.3z" />
    <path d="M61.7,63.2C61.7,63.2,61.7,63.2,61.7,63.2C61.6,63.2,61.6,63.2,61.7,63.2C61.7,63.2,61.7,63.2,61.7,63.2z" />
    <path d="M59.7,60.9c0.1-0.1,0.1-0.1,0.2-0.2C59.8,60.7,59.8,60.8,59.7,60.9z" />
</svg>
)}
  </div>);
} 


export default QuestionFlowVote;