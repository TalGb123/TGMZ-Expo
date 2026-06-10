import { useRouter } from "expo-router";
import { Pressable, StyleSheet,Text,View } from "react-native";
export default function NotFound(){
    const router =useRouter()
    return (<View style={styles.container}> 
        <Pressable
        onPress={()=>{
            router.back()
        }}>

        <Text> Not found click to go back</Text>
        </Pressable>
    </View>)
}
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    }
})