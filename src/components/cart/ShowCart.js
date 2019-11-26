import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Button
} from "react-native";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { connect } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import { bindActionCreators } from 'redux';
import {removeFromList} from "../../redux/actions/index"
 class ShowCart extends Component {
    deleteItemt(index){
        this.props.removeItemFromCart(index);
    }
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.titleText}>Locations saved in List</Text>
                <Text style={styles.secondaryText}>You have {this.props.listItems.length} saved locations </Text>
                <FlatList
                    data={this.props.listItems}
                    renderItem={({item, index,separators}) => (
                        <TouchableOpacity                        
                            onShowUnderlay={separators.highlight}
                            onHideUnderlay={separators.unhighlight}>
                            <View  style={styles.insideContiner}>
                                <View style={{alignItems: 'center'}}>        
                                    <Text style={styles.font}>{item.city}</Text>
                                </View>
                                <View>
                                <Button color="indigo"onPress={()=>this.deleteItemt(item)} title="Remove"></Button>
                                </View>
                            </View>
                        </TouchableOpacity>
                    
                    )}
                    keyExtractor={(x,i)=>i}
                />
            </View>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        listItems: state.carts
    }
}
const mapDispatchToProps = dispatch => bindActionCreators({
    removeItemFromCart: payload => removeFromList(payload),
}, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(ShowCart)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    insideContiner: {
        marginTop:25,
        width: 150,
    },
    titleText: {
        fontSize: 25,
        textAlign: 'center',
    },
    secondaryText: {
        fontSize: 20,
        color: "indigo",
    },
    font: {
        fontSize: 20,
        marginBottom: 2
    },
    buttonMenu:{
        backgroundColor: "indigo",
        marginTop: 55,
        
    },
    
    itemsInFlatList: {
        marginBottom: 25
    }
});