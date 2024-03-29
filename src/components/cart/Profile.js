import React, { Component } from 'react'
import { Text, View, AsyncStorage, StyleSheet, Image,TextInput, ActivityIndicator, Alert,TouchableOpacity, PixelRatio} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Button } from 'react-native-elements';
import ImagePicker from 'react-native-image-picker';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {userDetail} from "../../redux/actions/userDetail"
import Icon from 'react-native-vector-icons/Feather';
import DropdownAlert from 'react-native-dropdownalert';
import {isLoading} from "../../redux/actions/registered"

const FieldWrapper = ({ children, label, formikProps, formikKey }) => (
    <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
      <Text style={{ marginBottom: 3 }}>{label}</Text>
      {children}
      <Text style={{ color: 'red' }}>
        {formikProps.touched[formikKey] && formikProps.errors[formikKey]}
      </Text>
    </View>
  );
  const StyledInput = ({ label, formikProps, formikKey, ...rest }) => {
    const inputStyles = {
      borderBottomWidth: 2,
      borderColor: 'indigo',
      marginBottom: "-3%",
      marginTop: "-2%",
      marginLeft: "5%",
      height: hp('6.4%'),
      width: wp('50%'),
    };
    if (formikProps.touched[formikKey] && formikProps.errors[formikKey]) {
      inputStyles.borderColor = 'red';
    }
    return (
      <FieldWrapper label={label} formikKey={formikKey} formikProps={formikProps}>
        <TextInput
          style={inputStyles}
          onChangeText={formikProps.handleChange(formikKey)}
          onBlur={formikProps.handleBlur(formikKey)}
          {...rest}
        />
      </FieldWrapper>
    );
  };
  const validationSchema = yup.object().shape({
      name: yup
          .string()
          .label('Username')
          .required(), 
  });
export class Profile extends Component {
    constructor(props){
        super(props);
        this.state = {
            avatarSource: null,
            inputFieldHideShow: false,
            photo: null,
            hideInputContent: false
        }
        this.handleUploadPhoto = this.handleUploadPhoto.bind(this);
      }
    componentDidMount(){
        const sourceImage = {uri: this.props.reducer_data[0].user.image_url}
        this.setState({
          avatarSource: sourceImage,
        })
      }
    handleUploadPhoto() {
      const options = {
        quality: 1.0,
        maxWidth: 500,
        maxHeight: 500,
        storageOptions: {
          skipBackup: true,
        },
      };
      ImagePicker.showImagePicker(options, response => {
        console.log('Response after getting picture from Camera = ', response);
        if (response.didCancel) {
          console.log('User cancelled photo picker');
        } 
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } 
        else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton);
        } 
        else {    
          let source = {uri: response.uri};
          this.setState({
            avatarSource: source,
            photo: response,
          });
          setTimeout(() => {
            this.dropDownAlertRef.alertWithType(
              'success',
              'Congratulation',
               "Your profile picture Saved Successfully",
            );
          }, 1000);
        }
      });
    }
    createFormData(pic, body) {
      const data = new FormData(); 
      if(pic === null){
        Object.keys(body).forEach(key => {
          data.append(key, body[key]);
        });
        return data;
      }
      else {
        data.append("avatar", {
          name: pic.fileName,
          type: pic.type,
          uri:
            Platform.OS === "android" ? pic.uri : pic.uri.replace("file://", "")
        });
        Object.keys(body).forEach(key => {
          data.append(key, body[key]);
        });
        return data;
      }
    };
    async EditUserApiCall(photo , otherParams) {
      const url = 'https://space-rental.herokuapp.com/users/edit_user_call';
      try {
          const response = await fetch(url, {
            method: 'POST', 
            body: this.createFormData(photo, otherParams),
          });
          const json = await response.json();
          console.log("Edited responce is: ", JSON.stringify(json));
          this.props.userDetail(json);
          console.log('state saved is  :', this.props.reducer_data);
      } 
      catch (error) {
          console.error('Error:', error);
          alert("Upload failed!");
      }
    }
    handleSubmit(values) {
      if (values){
        console.log("values are -------------------------------------------- " , values);
        const {user} = this.props
        let obj = {};   
        obj["id"] =  this.props.reducer_data[0].user.id;
        obj["first_name"] = values.name;
        obj["last_name"] = this.props.reducer_data[0].user.last_name;   
        this.EditUserApiCall(this.state.photo , obj);
        this.props.loadingAction(false)
        this.setState({
          inputFieldHideShow: false 
        })
        setTimeout(() => {
          this.dropDownAlertRef.alertWithType(
            'success',
            'Congratulation',
             (`Your username as ${this.props.reducer_data[0].user.first_name} saved successfully`) ,
          );
        }, 500);
      } 
    }
    editUsername(){
        this.setState({              
          inputFieldHideShow: true  
        });
        
      } 
    render() {
      console.log("IN RENDER", this.props.reducer_data[0].user.first_name)
        return (
            <View style={styles.container}>
                <Text style={{marginBottom: 15, fontSize: 30}}> Hi, {this.props.reducer_data[0].user.first_name} </Text>
                 <TouchableOpacity onPress={this.handleUploadPhoto.bind(this)}>
                      <View
                        style={[styles.avatar, styles.avatarContainer, {marginBottom: 20}]}>
                        {this.state.avatarSource === null ? (
                            <View>
                            <Text style={{marginLeft: 15}}>Select Photo</Text>
                            <Image
                                style={{width: 50, height: 50, margin: 30}}
                                source={require('../../../assets/menu.png')}
                            />
                            </View>
                        ) : (
                          <Image style={styles.avatar} source={this.state.avatarSource} />
                        )}
                      </View>
                  </TouchableOpacity>
                  <Text style={styles.usernameText}>{this.props.reducer_data[0].user.first_name}</Text>
            <View>
            
            {this.state.inputFieldHideShow ? (
                <Formik
                initialValues={this.state}    
                onSubmit={this.handleSubmit.bind(this)}
                validationSchema={validationSchema}
                >
                
                {formikProps => (
                    <View style={styles.inputandbuttonView}>
                      <React.Fragment>
                     
                     <StyledInput 
                          formikProps={formikProps}
                          formikKey="name"
                          placeholder="Please enter username"
                      />
                      {formikProps.isSubmitting ? (
                          <ActivityIndicator />
                      ) : (
                      <Button  
                      icon={
                        <Icon
                          name="save"
                          size={20}
                          color="white"
                        />
                      }
                      title="  Save "
                      buttonStyle={styles.save}  
                      onPress={formikProps.handleSubmit}
                      />
                    
                    )}
                    </React.Fragment>
                    </View>
                )}
                </Formik>
            ) : (
                  <Icon
                    name="edit"
                    size={30}
                    color="indigo"
                    onPress={this.editUsername.bind(this)}
                  />
            )}
          </View> 
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} closeInterval={1000}/>
           
          </View>
        )
    }
}
const styles = StyleSheet.create ({
    container: {
        flex: 1,
        marginTop: 50,
        alignItems: 'center',
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameText: {
   fontSize: 30,
  },
  inputField:{
    borderBottomColor: "indigo",
    marginBottom: "-3%",
    height: hp('8%'), 
    width: wp('40%'),
  },
  inputandbuttonView:{
    marginLeft: 30
  },
    titleText: {
        fontSize: 25,
        marginTop : "10%"
    },
    smallText: {
        fontSize: 15,
        marginTop : "10%"
    },
    name: {
      fontSize: 20,
      marginTop: "4%",
    },
    buttonMenu:{
      backgroundColor: "indigo",
      marginTop: "3%",
      width: wp("40%"),
      marginLeft: 0,
    },
    save:{
        backgroundColor: "indigo",
        width: wp("50%"),
        marginLeft: "12.3%",
        marginTop: 10
  
      },
    avatar: {
        borderRadius: 75,
        width: 150,
        height: 150,
      },
  });
const mapStateToProps = state => {
  return {
    reducer_data: state.user,
    loading: state.register.loading

  };
};
const mapDispatchToProps = dispatch => bindActionCreators({
  userDetail: payload => userDetail(payload),
  loadingAction: payload => isLoading(payload)

}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Profile);