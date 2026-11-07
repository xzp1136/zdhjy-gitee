  (func (;43500;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 0
    local.set 1
    i32.const 4366797
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3376472
      call 2180
      i32.const 4366797
      i32.const 1
      i32.store8
    end
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
        local.set 1
        br 1 (;@1;)
      end
      local.get 0
      i32.const -1
      i32.store offset=8
      i32.const 3354788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 4367468
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3354788
        call 2180
        i32.const 4367468
        i32.const 1
        i32.store8
      end
      i32.const 3354788
      i32.load
      local.tee 1
      i32.load offset=116
      if (result i32)  ;; label = @2
        local.get 1
      else
        local.get 1
        call 60460
        i32.const 3354788
        i32.load
      end
      i32.load offset=92
      i32.load
      local.tee 1
      if  ;; label = @2
        i32.const 0
        call 56046
        i32.load offset=52
        local.set 3
        i32.const 3376472
        i32.load
        local.set 4
        local.get 2
        i32.const 72
        i32.store offset=12
        local.get 3
        local.get 2
        i32.const 12
        i32.add
        local.get 2
        local.get 4
        call 34434
        local.get 1
        local.get 2
        i32.load offset=4
        i32.const 0
        call 44254
      end
      local.get 0
      local.get 0
      i32.load offset=20
      local.get 0
      call 43457
      i32.const 0
      local.set 1
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 1)
