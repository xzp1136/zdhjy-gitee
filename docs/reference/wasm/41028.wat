  (func (;41028;) (type 0) (param i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4365127
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3359688
      call 2180
      i32.const 3388096
      call 2180
      i32.const 3388100
      call 2180
      i32.const 3359836
      call 2180
      i32.const 3395032
      call 2180
      i32.const 3395036
      call 2180
      i32.const 4365127
      i32.const 1
      i32.store8
    end
    i32.const 3359836
    i32.load
    local.tee 1
    i32.load offset=116
    if (result i32)  ;; label = @1
      local.get 1
    else
      local.get 1
      call 60460
      i32.const 3359836
      i32.load
    end
    i32.load offset=92
    i32.load offset=8
    local.get 2
    i32.const 12
    i32.add
    i32.const 3395032
    i32.load
    call 45693
    local.get 0
    local.get 2
    i32.load offset=12
    i32.store offset=64
    block  ;; label = @1
      block  ;; label = @2
        i32.const 0
        call 56067
        i32.load offset=364
        i32.eqz
        if  ;; label = @3
          local.get 0
          i32.load offset=64
          i32.const 1
          i32.sub
          local.set 1
          i32.const 3359688
          i32.load
          local.tee 4
          i32.load offset=116
          if (result i32)  ;; label = @4
            local.get 4
          else
            local.get 4
            call 60460
            i32.const 3359688
            i32.load
          end
          i32.load offset=92
          i32.load
          local.tee 4
          i32.const 0
          local.get 4
          i32.load offset=12
          i32.const 1
          i32.sub
          local.tee 3
          local.get 1
          local.get 1
          local.get 3
          i32.gt_s
          select
          local.get 1
          i32.const 0
          i32.lt_s
          select
          local.get 2
          i32.const 12
          i32.add
          i32.const 3388100
          i32.load
          call 50458
          local.get 2
          i32.load offset=12
          local.set 1
          i32.const 3359836
          i32.load
          local.tee 3
          i32.load offset=116
          if (result i32)  ;; label = @4
            local.get 3
          else
            local.get 3
            call 60460
            i32.const 3359836
            i32.load
          end
          i32.load offset=92
          i32.load offset=12
          local.get 2
          i32.const 12
          i32.add
          i32.const 3395032
          i32.load
          call 45693
          local.get 4
          i32.load offset=12
          local.tee 3
          local.get 0
          i32.load offset=64
          i32.ge_s
          br_if 2 (;@1;)
          local.get 2
          i32.load offset=12
          local.tee 1
          i32.const 1
          i32.ne
          local.get 1
          local.get 3
          i32.const 5
          i32.sub
          local.tee 0
          i32.ge_s
          i32.and
          i32.eqz
          if  ;; label = @4
            i32.const 3359836
            i32.load
            local.tee 1
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 1
              call 60460
              i32.const 3359836
              i32.load
              local.set 1
            end
            i32.const 3395036
            i32.load
            local.set 3
            local.get 1
            i32.load offset=92
            i32.load offset=12
            local.set 1
            local.get 2
            local.get 0
            i32.store offset=12
            local.get 1
            local.get 2
            i32.const 12
            i32.add
            local.get 3
            call 45694
            local.get 4
            i32.load offset=12
            local.set 3
            local.get 0
            local.set 1
          end
          local.get 4
          local.get 0
          local.get 3
          i32.const 1
          i32.sub
          local.tee 3
          local.get 1
          i32.const 1
          i32.sub
          local.tee 1
          local.get 1
          local.get 3
          i32.gt_s
          select
          local.get 0
          local.get 1
          i32.gt_s
          select
          local.get 2
          i32.const 12
          i32.add
          i32.const 3388100
          i32.load
          call 50458
          br 1 (;@2;)
        end
        i32.const 0
        call 56067
        i32.load offset=364
        i32.const 2
        i32.eq
        if  ;; label = @3
          i32.const 0
          call 56067
          i32.load offset=628
          local.set 0
          i32.const 0
          call 56046
          i32.load offset=88
          i32.load offset=12
          local.set 1
          i32.const 0
          call 56046
          i32.load offset=88
          i32.const 0
          local.get 1
          i32.const 1
          i32.sub
          local.tee 1
          local.get 0
          local.get 0
          local.get 1
          i32.gt_s
          select
          local.get 0
          i32.const 0
          i32.lt_s
          select
          local.get 2
          i32.const 12
          i32.add
          i32.const 3388100
          i32.load
          call 50458
          br 1 (;@2;)
        end
        local.get 0
        i32.load offset=64
        i32.const 1
        i32.sub
        local.set 0
        i32.const 3359688
        i32.load
        local.tee 1
        i32.load offset=116
        if (result i32)  ;; label = @3
          local.get 1
        else
          local.get 1
          call 60460
          i32.const 3359688
          i32.load
        end
        i32.load offset=92
        i32.load
        local.tee 1
        i32.const 10
        local.get 1
        i32.load offset=12
        i32.const 1
        i32.sub
        local.tee 1
        local.get 0
        local.get 0
        local.get 1
        i32.gt_s
        select
        local.get 0
        i32.const 10
        i32.lt_s
        select
        local.get 2
        i32.const 12
        i32.add
        i32.const 3388100
        i32.load
        call 50458
      end
      local.get 2
      i32.load offset=12
      local.set 1
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 1)
