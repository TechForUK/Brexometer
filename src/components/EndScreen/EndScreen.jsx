import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from "mobx-react";
import CompareCollectionUsers from './partials/CompareUsersComponent';
import JoinGroupDialog from '../JoinGroupDialog';
import FollowUserDialog from '../FollowUserDialog';
//import MessengerModal from './partials/MessengerModal';
import MoreUserInfo from '../Components/modals/MoreUserInfo';

@inject("UserStore", "GroupStore")
@observer
class EndScreen extends Component {

  constructor(props) {
    super(props);

    this.state = {
      joinGroupModal: {
        isOpen: false,
        groupId: null
      },
      followUserModal: {
        isOpen: false,
        userId: null
      },
      userDataModal: {
        isOpen: false,
        user: null
      },
      messengerModal: {
        isOpen: false
      }
    }
  }

  // All 3 modals will be checked for need to be opened
  // If they need to be opened, they will be shown one behind another,
  // so that only top modal will be visible
  componentWillMount(){
    this.checkUserDetailsAll();
  }

  checkUserDetailsAll(){
    this.props.UserStore.getCachedMe().then(data => {
      if(!this.isUserDataSet(data)) {
        this.setState({
          userDataModal: {
            user: data,
            isOpen: true,
            shouldOpen: true,
          }
        })
      }})
    this.checkToShowJoinGroupModal();
    this.checkToShowFollowUserModal();
  }

  checkToShowJoinGroupModal() {
    // TODO showgroup/follow user fix these two - @jimbofreedman
    // const { GroupStore } = this.props;
    // if(this.dynamicConfig.config.survey_end.showJoinGroup_id) {
    //   GroupStore.getGroup(this.dynamicConfig.config.survey_end.showJoinGroup_id).then((group) => {
    //     if(!group.my_membership) {
    //       this.setState({
    //         joinGroupModal: {
    //           isOpen: true,
    //           shouldOpen: true,
    //           groupId: this.dynamicConfig.config.survey_end.showJoinGroup_id
    //         }
    //       })
    //     }
    //   })
    // }
  }

  checkToShowFollowUserModal() {
    // const { UserStore } = this.props;
    // if(this.dynamicConfig.config.survey_end.showFollowUser_id) {
    //   const userToFollowId = this.dynamicConfig.config.survey_end.showFollowUser_id;
    //   UserStore.getCachedMe().then((curUser) => {
    //     UserStore.amFollowingUser(curUser.id, userToFollowId).then((following) => {
    //       if(following.results.length === 0) {
    //         this.setState({
    //           followUserModal: {
    //             isOpen: true,
    //             shouldOpen: true,
    //             userId: this.dynamicConfig.config.survey_end.showFollowUser_id
    //           }
    //         })
    //       }
    //     })
    //   })
    // }
  }
  callNextModal(){

  }
  isUserDataSet(user) {
    return (user.dob && typeof user.gender === 'number' && user.address !== "");
  }

  render() {
    // TODO fix comparing users - @jimbofreedman
    // const usersToCompare = observable.shallowArray(this.dynamicConfig.config.survey_end.compare_users)
    const usersToCompare =  observable.shallowArray();
    return (
      <div>
        <CompareCollectionUsers userIds={usersToCompare} collectionId={this.props.match.params.collectionId}/>
        <FollowUserDialog isOpen={this.state.followUserModal.isOpen} userId={this.state.followUserModal.userId}/>
        <JoinGroupDialog isOpen={this.state.joinGroupModal.isOpen} groupId={this.state.joinGroupModal.groupId}/>
        <MoreUserInfo shown={this.state.userDataModal.isOpen} user={this.state.userDataModal.user} />
        {/*<MessengerModal isOpen={this.state.messengerModal.isOpen} />*/}
      </div>
    );
  }
}

export default EndScreen;
