  (func (;41073;) (type 0) (param i32 i32) (result i32)
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 0
          i32.load offset=8
          br_table 0 (;@3;) 1 (;@2;) 2 (;@1;)
        end
        local.get 0
        i64.const 1
        i64.store offset=8 align=4
        i32.const 1
        return
      end
      local.get 0
      i32.load offset=16
      local.set 1
      local.get 0
      i32.const -1
      i32.store offset=8
      local.get 1
      i32.const 1
      i32.store8 offset=40
      local.get 1
      i32.const 1
      i32.store offset=16
    end
    i32.const 0)
